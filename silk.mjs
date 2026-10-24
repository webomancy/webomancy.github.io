export const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const TAU=Math.PI*2;
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});

// Designed geometry: organic spacing and curved silk, without a spring simulation.
export class SilkWeb{
 constructor(width,top,height,mobile,viewportHeight=900){
  this.width=width;this.mobile=mobile;this.support=null;
  this.cx=width*(mobile?.54:.755);
  this.cy=top+(mobile?245:viewportHeight*.59);
  this.rx=width*(mobile?.41:.27);
  this.ry=mobile?Math.min(100,width*.195):Math.min(230,Math.max(170,viewportHeight*.215));
  this.rotation=mobile?-.23:-.23;
  this.radii=Array.from({length:mobile?11:14},(_,i)=>mobile?.07+i*.093:.064+i*.072);
  this.angles=Array.from({length:26},(_,i)=>-Math.PI/2+i*TAU/26+Math.sin(i*2.7)*.018);
  this.hub={x:this.cx,y:this.cy};
  this.entry=this.point(-Math.PI/2,1.08);
  // Every spoke passes through the ring junctions. Right-side spokes stop
  // at that junction; the attached weave supplies their continuation.
  this.spokes=this.angles.map((angle,i)=>{
   const points=[this.point(angle,.018),...this.radii.map(radius=>this.point(angle,radius))];
   const supported=(i>=10&&i<=18)||i===22;
   if(points.at(-1).x<this.cx&&!supported)points.push(this.point(angle,1.08+(i%3)*.025));
   return points;
  });
  this.ringSegments=new Map(this.radii.map(radius=>[radius,this.angles.map((_,i)=>this.segment(i,radius))]));
  this.catchRadius=this.radii[mobile?6:5];
  this.catchContour=this.contour(this.catchRadius);
  this.bottom=this.cy+this.ry+50;
  this.top=this.cy-this.ry-50;
  this.setEdgeWeaves();
 }
 setEdgeWeaves(){
  const wallX=this.mobile?this.width-14:this.width-.5;
  const clusters=[this.mobile?[2,3]:[1,2,3],this.mobile?[11,12]:[10,11,12]];
  const attached=new Set();
  this.edgeWeaves=clusters.map((indices,side)=>{
   const starts=indices.flatMap(i=>{
    const p=this.point(this.angles[i],this.radii.at(-1));
    if(p.x>=wallX-4)return [];
    attached.add(i);return [p];
   });
   const wallY=side?this.cy+this.ry*.42:Math.min(...starts.map(p=>p.y))-(this.mobile?14:28);
   const threads=starts.map((start,j)=>{
    const end={x:wallX,y:wallY+j*(this.mobile?5:8)},span=end.x-start.x;
    const a={x:start.x+span*.32,y:start.y+(side?12:-(this.mobile?14:32))};
    const b={x:end.x-span*.22,y:end.y+(side?8:-12)};
    return Array.from({length:49},(_,i)=>{const u=i/48,t=1-u;return {x:t*t*t*start.x+3*t*t*u*a.x+3*t*u*u*b.x+u*u*u*end.x,y:t*t*t*start.y+3*t*t*u*a.y+3*t*u*u*b.y+u*u*u*end.y};});
   });
   return {threads,ties:[18,34,48].map(i=>threads.map(line=>line[i]))};
  });
  // Close only the uncovered right-edge junctions. Existing paired curves
  // retain their shape; each remaining node receives one quiet wall tether.
  this.angles.forEach((angle,i)=>{
   const start=this.point(angle,this.radii.at(-1));
   if(attached.has(i)||start.x<=this.cx||start.x>=wallX)return;
   const span=wallX-start.x;
   const end={x:wallX,y:start.y+(start.y<this.cy?-1:1)*Math.min(18,span*.12)};
   const sag=Math.min(this.mobile?7:12,span*.1);
   const a={x:start.x+span*.35,y:start.y+sag};
   const b={x:start.x+span*.76,y:end.y+sag*.5};
   const line=Array.from({length:49},(_,j)=>{const u=j/48,t=1-u;return {x:t*t*t*start.x+3*t*t*u*a.x+3*t*u*u*b.x+u*u*u*end.x,y:t*t*t*start.y+3*t*t*u*a.y+3*t*u*u*b.y+u*u*u*end.y};});
   this.edgeWeaves.push({threads:[line],ties:[]});
  });
  const points=this.edgeWeaves.flatMap(g=>g.threads.flat());
  this.top=Math.min(this.top,...points.map(p=>p.y));this.bottom=Math.max(this.bottom,...points.map(p=>p.y));
 }
 drawEdgeWeaves(ctx){
  this.edgeWeaves.forEach(({threads,ties})=>{
   threads.forEach((line,i)=>{
    const first=line[0],last=line.at(-1),tone=ctx.createLinearGradient(first.x,0,last.x,0);
    tone.addColorStop(0,'rgba(214,194,155,.26)');tone.addColorStop(.72,'rgba(214,194,155,.19)');tone.addColorStop(1,'rgba(214,194,155,.13)');
    ctx.beginPath();line.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=tone;ctx.lineWidth=i===0?.65:.5;ctx.stroke();
    ctx.beginPath();ctx.arc(last.x,last.y,.8,0,TAU);ctx.fillStyle='rgba(230,210,170,.34)';ctx.fill();
   });
   ties.forEach((line,index)=>{if(line.length<2)return;ctx.beginPath();ctx.moveTo(line[0].x,line[0].y);for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i];ctx.quadraticCurveTo((a.x+b.x)/2+(index===2?0:3),(a.y+b.y)/2,b.x,b.y);}ctx.strokeStyle='rgba(200,179,140,.18)';ctx.lineWidth=.5;ctx.stroke();});
  });
 }
 setSupport(wallY){
  
  const taper=this.mobile?5:13;
  const strandCount=this.mobile?3:9;
  const leftX=this.mobile?14:2;
  const point=(u,v)=>{
   // The warp joins existing radial nodes, so the two woven surfaces meet.
   const index=18-v*(this.mobile?5:8),lo=Math.floor(index),hi=Math.min(25,lo+1),f=index-lo;
   const angle=this.angles[lo]*(1-f)+this.angles[hi]*f;
   const end=this.point(angle,this.radii.at(-1));
   const start={x:leftX,y:wallY+(v-.5)*taper};
   const a={x:end.x*.65,y:wallY+(v-.5)*taper+(this.mobile?5:24)};
   const b={x:end.x*.96,y:Math.max(wallY+(this.mobile?3:26)+v*(this.mobile?15:76),end.y+(this.mobile?12:65))};
   const t=1-u;
   return {x:t*t*t*start.x+3*t*t*u*a.x+3*t*u*u*b.x+u*u*u*end.x,y:t*t*t*start.y+3*t*t*u*a.y+3*t*u*u*b.y+u*u*u*end.y};
  };
  const threads=Array.from({length:strandCount},(_,j)=>Array.from({length:65},(_,i)=>point(i/64,j/(strandCount-1))));
  const wefts=Array.from({length:this.mobile?3:18},(_,i)=>{
   const u=.12+.86*Math.pow((i+1)/(this.mobile?4:19),.78);
   return Array.from({length:33},(_,j)=>point(u,j/32));
  });
  const dew=wefts.flatMap((line,i)=>i%3===0?[line[8],line[24]]:[]);
  this.support={threads,wefts,dew,wallY};
  this.bottom=Math.max(this.bottom,...threads.flat().map(p=>p.y));
 }
 drawSupport(ctx,time){
  if(!this.support)return;
  const {threads,wefts,dew,wallY}=this.support;
  const trace=points=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));};
  const tone=ctx.createLinearGradient(0,0,this.width,0);
  tone.addColorStop(0,'rgba(218,197,159,.26)');tone.addColorStop(.36,'rgba(200,169,110,.20)');tone.addColorStop(1,'rgba(218,197,159,.31)');
  ctx.strokeStyle=tone;
  threads.forEach((line,i)=>{trace(line);ctx.lineWidth=i===0||i===threads.length-1?.78:.5;ctx.stroke();});
  wefts.forEach((line,i)=>{trace(line);ctx.strokeStyle=`rgba(200,179,140,${.13+i/wefts.length*.11})`;ctx.lineWidth=.5;ctx.stroke();});
  dew.forEach((p,i)=>{const glint=Math.pow(Math.max(0,Math.sin(time*.24+i*.8)),12);ctx.beginPath();ctx.arc(p.x,p.y,.65+glint*.2,0,TAU);ctx.fillStyle=`rgba(235,217,184,${.28+glint*.25})`;ctx.fill();});
  // A quiet fixing at the page edge makes the support feel attached.
  ctx.strokeStyle='rgba(200,169,110,.2)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(threads[0][0].x,wallY-(this.mobile?8:17));ctx.lineTo(threads[0][0].x,wallY+(this.mobile?8:17));ctx.stroke();
  for(const y of [threads[0][0].y,threads.at(-1)[0].y]){ctx.beginPath();ctx.arc(threads[0][0].x,y,this.mobile?.9:1.2,0,TAU);ctx.fillStyle='rgba(230,210,170,.65)';ctx.fill();}
 }
 point(angle,radius){
  const shape=1+.035*Math.sin(angle*3+.7)+.02*Math.cos(angle*5);
  const theta=angle+.055*radius*Math.sin(angle+.3);
  const x=Math.cos(theta)*this.rx*radius*shape,y=Math.sin(theta)*this.ry*radius*shape;
  return {x:this.cx+x*Math.cos(this.rotation)-y*Math.sin(this.rotation),y:this.cy+x*Math.sin(this.rotation)+y*Math.cos(this.rotation)};
 }
 segment(i,radius){
  const cached=this.ringSegments?.get(radius);if(cached)return cached[i];
  const a=this.point(this.angles[i],radius),b=this.point(this.angles[(i+1)%this.angles.length],radius);
  const center=mix(a,b,.5),sag=.018+.008*Math.sin(i*1.7);
  return {a,b,c:mix(center,this.hub,sag)};
 }
 contour(radius){
  const points=[];
  for(let i=0;i<this.angles.length;i++){
   const {a,b,c}=this.segment(i,radius);
   for(let j=0;j<8;j++){const t=j/8,u=1-t;points.push({x:u*u*a.x+2*u*t*c.x+t*t*b.x,y:u*u*a.y+2*u*t*c.y+t*t*b.y});}
  }
  return points;
 }
 surface(x){
  if(this.mobile)return this.cy-10+Math.min(5,Math.pow((x-this.cx)/this.rx,2)*8);
  let y=Infinity;
  for(let i=0;i<this.catchContour.length;i++){
   const a=this.catchContour[i],b=this.catchContour[(i+1)%this.catchContour.length];
   if(x>=Math.min(a.x,b.x)&&x<=Math.max(a.x,b.x)&&a.x!==b.x)y=Math.min(y,a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x));
  }
  if(Number.isFinite(y))return y;
  return this.catchContour.reduce((a,b)=>Math.abs(a.x-x)<Math.abs(b.x-x)?a:b).y;
 }
 traceRing(ctx,radius){
  ctx.beginPath();
  this.angles.forEach((_,i)=>{const {a,b,c}=this.segment(i,radius);if(!i)ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.x,c.y,b.x,b.y);});
  ctx.closePath();
 }
 pluck(k,time){
  if(!this.plucks)this.plucks=[-999,-999,-999,-999];
  if(k>=0&&k<4)this.plucks[k]=time;
 }
 setAnchors(cards,scrollY=0){
  if(!cards||!cards.length){this.anchorStrands=[];return;}
  if(this.mobile){
    // 2 Symmetrical Architectural Suspension Warps
    // Col 1 (left): vertical axis at x = cards[0].left + 24
    // Col 2 (right): vertical axis at x = cards[1].left + 24
    const xOffset = 18;
    const yElevation = 26;

    const x1 = Math.round(cards[0].left + xOffset);
    const x2 = Math.round(cards[1].left + xOffset);

    const pin0 = { x: x1, y: Math.round(cards[0].top + scrollY - yElevation) };
    const pin1 = { x: x2, y: Math.round(cards[1].top + scrollY - yElevation) };
    const pin2 = { x: x1, y: Math.round(cards[2].top + scrollY - yElevation) };
    const pin3 = { x: x2, y: Math.round(cards[3].top + scrollY - yElevation) };

    // Web attachment nodes on the lower web rim
    const webNode0 = this.point(this.angles[15], this.radii.at(-1));
    const webNode1 = this.point(this.angles[12], this.radii.at(-1));

    // Strand 0 (Web -> Custom websites)
    const dx0 = pin0.x - webNode0.x, dy0 = pin0.y - webNode0.y;
    const cp1_0 = { x: webNode0.x + dx0 * 0.35, y: webNode0.y + dy0 * 0.45 };
    const cp2_0 = { x: webNode0.x + dx0 * 0.85, y: webNode0.y + dy0 * 0.85 };

    // Strand 1 (Web -> Google & AI rankings)
    const dx1 = pin1.x - webNode1.x, dy1 = pin1.y - webNode1.y;
    const cp1_1 = { x: webNode1.x + dx1 * 0.35, y: webNode1.y + dy1 * 0.45 };
    const cp2_1 = { x: webNode1.x + dx1 * 0.85, y: webNode1.y + dy1 * 0.85 };

    // Strand 2 (Custom websites -> Review systems): vertical suspension warp
    const cp1_2 = { x: x1, y: pin0.y + (pin2.y - pin0.y) * 0.35 };
    const cp2_2 = { x: x1, y: pin0.y + (pin2.y - pin0.y) * 0.70 };

    // Strand 3 (Google & AI rankings -> Business profile): vertical suspension warp
    const cp1_3 = { x: x2, y: pin1.y + (pin3.y - pin1.y) * 0.35 };
    const cp2_3 = { x: x2, y: pin1.y + (pin3.y - pin1.y) * 0.70 };

    this.anchorStrands = [
     { pin: pin0, webNode: webNode0, cp1: cp2_0, cp2: cp1_0, parentIndex: -1 },
     { pin: pin1, webNode: webNode1, cp1: cp2_1, cp2: cp1_1, parentIndex: -1 },
     { pin: pin2, webNode: pin0, cp1: cp2_2, cp2: cp1_2, parentIndex: 0 },
     { pin: pin3, webNode: pin1, cp1: cp2_3, cp2: cp1_3, parentIndex: 1 }
    ];
   }else{
    const nodeIndices=[22,3,16,9];
    this.anchorStrands=cards.map((r,i)=>{
     const isRight=(i===1||i===3);
     const pin={x:isRight?r.left:r.right,y:r.top+scrollY+r.height*.42};
     const webNode=this.point(this.angles[nodeIndices[i]],this.radii.at(-1));
     const dx=webNode.x-pin.x,dy=webNode.y-pin.y;
     const cp1={x:pin.x+dx*.42,y:pin.y+(dy>0?14:-14)};
     const cp2={x:pin.x+dx*.76,y:webNode.y};
     return {pin,webNode,cp1,cp2};
    });
   }
  }
  drawAnchorStrands(ctx,time){
   if(!this.anchorStrands||!this.anchorStrands.length)return;
   if(!this.plucks)this.plucks=[-999,-999,-999,-999];

   if(this.mobile){
    this.anchorStrands.forEach((strand,k)=>{
     ctx.save();
     const {pin,webNode,parentIndex}=strand;
     let cp1={...strand.cp1},cp2={...strand.cp2};
     const pluckAge=time-this.plucks[k];
     const isClicked=pluckAge>=0&&pluckAge<1.8;

     if(isClicked&&pluckAge<.75){
      const wave=Math.sin(pluckAge*36)*Math.exp(-pluckAge*5.5)*3;
      cp1.x+=wave*.5;cp1.y+=wave*.7;
      cp2.x-=wave*.4;cp2.y+=wave*.5;
     }
     ctx.beginPath();
     ctx.moveTo(pin.x,pin.y);
     ctx.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,webNode.x,webNode.y);

     if(isClicked){
      const activity=Math.min(1,Math.exp(-pluckAge*1.6)*1.4);
      ctx.save();
      ctx.strokeStyle=`rgba(228,200,145,${(.35+.6*activity).toFixed(3)})`;
      ctx.lineWidth=0.7+0.9*activity;
      ctx.shadowColor='rgba(200,169,110,.65)';
      ctx.shadowBlur=7*activity;
      ctx.stroke();
      ctx.restore();

      // Feeding pulse traveling down the strand from web to pin ONLY when clicked
      const pulseT=clamp(pluckAge/1.0);
      if(pulseT>=0&&pulseT<=1){
       const u=1-pulseT;
       const bx=u*u*u*webNode.x+3*u*u*pulseT*cp2.x+3*u*pulseT*pulseT*cp1.x+pulseT*pulseT*pulseT*pin.x;
       const by=u*u*u*webNode.y+3*u*u*pulseT*cp2.y+3*u*pulseT*pulseT*cp1.y+pulseT*pulseT*pulseT*pin.y;
       ctx.beginPath();ctx.arc(bx,by,2.0+activity*.8,0,TAU);
       ctx.fillStyle='#fffdf7';ctx.shadowColor='#c8a96e';ctx.shadowBlur=7;ctx.fill();
      }

      const pinPulse=pluckAge>=0.5&&pluckAge<1.4?Math.sin((pluckAge-0.5)*Math.PI/0.9):activity*.6;
      ctx.fillStyle='#c8a96e';ctx.beginPath();ctx.arc(pin.x,pin.y,2.4+pinPulse*1.0,0,TAU);ctx.fill();
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(pin.x,pin.y,1.3+pinPulse*.5,0,TAU);ctx.fill();
      if(pinPulse>0.1){
       ctx.strokeStyle=`rgba(200,169,110,${(.25*pinPulse).toFixed(3)})`;
       ctx.lineWidth=0.6;
       ctx.beginPath();ctx.arc(pin.x,pin.y,3.8+pinPulse*2.2,0,TAU);ctx.stroke();
      }
     }else{
      // REFINED LUXURY REST STATE - Whisper-delicate, seamless silk
      ctx.strokeStyle='rgba(200,169,110,.25)';
      ctx.lineWidth=.55;
      ctx.stroke();

      // Delicate dewy brass node with subtle halo
      ctx.fillStyle='#c8a96e';
      ctx.beginPath();ctx.arc(pin.x,pin.y,1.6,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(200,169,110,.18)';
      ctx.beginPath();ctx.arc(pin.x,pin.y,3.2,0,TAU);ctx.fill();
     }
     ctx.restore();
    });
  }else{
   // DESKTOP: Subtle connecting strings exactly like before
   this.anchorStrands.forEach((strand,k)=>{
    const h=this.hoverLevels?this.hoverLevels[k]:0;
    const {pin,webNode,cp1,cp2}=strand;
    ctx.beginPath();ctx.moveTo(pin.x,pin.y);
    ctx.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,webNode.x,webNode.y);
    if(h>0.02){
     ctx.save();
     ctx.strokeStyle=`rgba(200,169,110,${(0.32+0.66*h).toFixed(3)})`;
     ctx.lineWidth=0.7+1.3*h;
     ctx.shadowColor='#c8a96e';ctx.shadowBlur=10*h;
     ctx.stroke();
     ctx.restore();
     const pulseT=((time*1.3)%1),u=1-pulseT;
     const bx=u*u*u*pin.x+3*u*u*pulseT*cp1.x+3*u*pulseT*pulseT*cp2.x+pulseT*pulseT*pulseT*webNode.x;
     const by=u*u*u*pin.y+3*u*u*pulseT*cp1.y+3*u*pulseT*pulseT*cp2.y+pulseT*pulseT*pulseT*webNode.y;
     ctx.beginPath();ctx.arc(bx,by,1.8+h,0,TAU);ctx.fillStyle='#fffdf7';ctx.fill();
     ctx.fillStyle='#c8a96e';ctx.beginPath();ctx.arc(pin.x,pin.y,2.4+h*.8,0,TAU);ctx.fill();
    }else{
     ctx.strokeStyle='rgba(200,169,110,.16)';
     ctx.lineWidth=.5;
     ctx.stroke();
     ctx.fillStyle='rgba(200,169,110,.38)';
     ctx.beginPath();ctx.arc(pin.x,pin.y,1.5,0,TAU);
     ctx.fill();
    }
   });
  }
 }
 draw(ctx,{time=0,active=-1,ripples=[],mobile=false}={}){
  if(!this.hoverLevels)this.hoverLevels=[0,0,0,0];
  for(let k=0;k<4;k++){
   const target=(active===k)?(mobile?.32:1):0;
   const speed=target>this.hoverLevels[k]?0.22:0.12;
   this.hoverLevels[k]+=(target-this.hoverLevels[k])*speed;
   if(Math.abs(this.hoverLevels[k]-target)<0.005)this.hoverLevels[k]=target;
  }
  const DEDICATED_RINGS=[11,8,5,2];
  const QUADRANT_ANGLES=[-2.35,-0.78,2.35,0.78];
  const glow=ctx.createRadialGradient(this.cx,this.cy,0,this.cx,this.cy,this.rx);
  glow.addColorStop(0,'rgba(200,169,110,.045)');glow.addColorStop(.65,'rgba(200,169,110,.012)');glow.addColorStop(1,'rgba(200,169,110,0)');
  ctx.fillStyle=glow;ctx.fillRect(this.cx-this.rx*1.1,this.cy-this.rx,this.rx*2.2,this.rx*2);

  // Quadrant ambient brass bloom on hover
  for(let k=0;k<4;k++){
   const h=this.hoverLevels[k];
   if(h<0.01)continue;
   const qAng=QUADRANT_ANGLES[k];
   const qx=this.cx+Math.cos(qAng)*(this.rx*.44);
   const qy=this.cy+Math.sin(qAng)*(this.ry*.44);
   const qGrad=ctx.createRadialGradient(qx,qy,0,qx,qy,this.rx*.88);
   qGrad.addColorStop(0,`rgba(200,169,110,${(0.26*h).toFixed(3)})`);
   qGrad.addColorStop(.48,`rgba(200,169,110,${(0.09*h).toFixed(3)})`);
   qGrad.addColorStop(1,'rgba(200,169,110,0)');
   ctx.fillStyle=qGrad;ctx.beginPath();ctx.arc(qx,qy,this.rx*.88,0,TAU);ctx.fill();
  }

  this.drawSupport(ctx,time);
  this.drawEdgeWeaves(ctx);
  this.drawAnchorStrands(ctx,time);

  // Radial spokes with quadrant #C8A96E brass highlighting
  this.angles.forEach((angle,i)=>{
   const outer=this.spokes[i].at(-1);
   const spokeAngle=Math.atan2(outer.y-this.cy,outer.x-this.cx);
   let spokeBoost=0;
   for(let k=0;k<4;k++){
    if(this.hoverLevels[k]<0.01)continue;
    const d=Math.abs(Math.atan2(Math.sin(spokeAngle-QUADRANT_ANGLES[k]),Math.cos(spokeAngle-QUADRANT_ANGLES[k])));
    if(d<1.05){
     const w=clamp(1-d/1.05);
     spokeBoost=Math.max(spokeBoost,w*this.hoverLevels[k]);
    }
   }
   ctx.beginPath();this.spokes[i].forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
   if(spokeBoost>0.02){
    ctx.save();
    ctx.strokeStyle=`rgba(200,169,110,${(0.22+0.76*spokeBoost).toFixed(3)})`;
    ctx.lineWidth=0.55+0.95*spokeBoost;
    if(spokeBoost>0.25){ctx.shadowColor='#c8a96e';ctx.shadowBlur=11*spokeBoost;}
    ctx.stroke();
    ctx.restore();
   }else{
    ctx.strokeStyle=`rgba(214,194,155,${0.18+(i%4)*.035})`;
    ctx.lineWidth=i%5===0?.8:.55;
    ctx.stroke();
   }
  });

  // Concentric rings with dedicated ring glow & quadrant brass brilliance
  this.radii.forEach((radius,ringIndex)=>{
   let ringDedicatedBoost=0;
   for(let k=0;k<4;k++){
    if(ringIndex===DEDICATED_RINGS[k]){
     ringDedicatedBoost=Math.max(ringDedicatedBoost,this.hoverLevels[k]);
    }
   }
   this.traceRing(ctx,radius);
   if(ringDedicatedBoost>0.02){
    if(ringDedicatedBoost>0.15){
     ctx.save();
     ctx.strokeStyle=`rgba(200,169,110,${(0.35*ringDedicatedBoost).toFixed(3)})`;
     ctx.lineWidth=3.4*ringDedicatedBoost;
     ctx.stroke();
     ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle=`rgba(200,169,110,${(0.3+0.68*ringDedicatedBoost).toFixed(3)})`;
    ctx.lineWidth=0.65+1.15*ringDedicatedBoost;
    ctx.shadowColor='#c8a96e';ctx.shadowBlur=9*ringDedicatedBoost;
    ctx.stroke();
    ctx.restore();
   }else{
    ctx.strokeStyle=`rgba(214,194,155,${0.19+.13*(1-radius)+(ringIndex%3===0?.06:0)})`;
    ctx.lineWidth=ringIndex%4===0?.7:.5;
    ctx.stroke();
   }

   // Incandescent golden brass quadrant arc segments
   for(let k=0;k<4;k++){
    const h=this.hoverLevels[k];
    if(h<0.02)continue;
    const isDedicated=(ringIndex===DEDICATED_RINGS[k]);
    this.angles.forEach((_,i)=>{
     const {a,b,c}=this.segment(i,radius);
     const segAngle=Math.atan2((a.y+b.y)/2-this.cy,(a.x+b.x)/2-this.cx);
     const d=Math.abs(Math.atan2(Math.sin(segAngle-QUADRANT_ANGLES[k]),Math.cos(segAngle-QUADRANT_ANGLES[k])));
     if(d<0.98){
      const segWeight=clamp(1-d/0.98)*h;
      if(segWeight>0.02){
       ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.x,c.y,b.x,b.y);
       if(isDedicated){
        ctx.save();
        ctx.strokeStyle=`rgba(255,238,195,${(0.42+0.56*segWeight).toFixed(3)})`;
        ctx.lineWidth=1.2+1.4*segWeight;
        ctx.shadowColor='#c8a96e';ctx.shadowBlur=12*segWeight;
        ctx.stroke();
        ctx.restore();
       }else{
        ctx.strokeStyle=`rgba(200,169,110,${(0.26+0.46*segWeight).toFixed(3)})`;
        ctx.lineWidth=0.6+0.7*segWeight;
        ctx.stroke();
       }
      }
     }
    });
   }
  });

  // Ripple glints
  ripples.forEach(r=>{
   const age=time-r.time,radius=.13+age*.58;if(radius>1.01)return;
   this.traceRing(ctx,radius);ctx.strokeStyle=`rgba(239,222,190,${.4*clamp(1-age/1.5)})`;ctx.lineWidth=1.1;ctx.stroke();
  });

  // Dew nodes with incandescent brass glow in active quadrant & dedicated ring
  this.radii.forEach((radius,j)=>this.angles.forEach((angle,i)=>{
   if((i*7+j*3)%(this.mobile?7:5)!==0||j<2)return;
   const point=this.point(angle,radius);
   const pAngle=Math.atan2(point.y-this.cy,point.x-this.cx);
   let dewBoost=0,isDedicatedDew=false;
   for(let k=0;k<4;k++){
    if(this.hoverLevels[k]<0.02)continue;
    const d=Math.abs(Math.atan2(Math.sin(pAngle-QUADRANT_ANGLES[k]),Math.cos(pAngle-QUADRANT_ANGLES[k])));
    if(d<1.0){
     const w=clamp(1-d/1.0)*this.hoverLevels[k];
     dewBoost=Math.max(dewBoost,w);
     if(j===DEDICATED_RINGS[k])isDedicatedDew=true;
    }
   }
   const glint=Math.pow(Math.max(0,Math.cos(angle-time*.17+radius*3)),18);
   const baseSize=.55+((i+j)%4)*.19;
   const size=baseSize+(isDedicatedDew?1.6*dewBoost:0.9*dewBoost);
   ctx.beginPath();ctx.arc(point.x,point.y,size,0,TAU);
   if(dewBoost>0.08){
    ctx.fillStyle=isDedicatedDew?'#fffdf7':`rgba(245,225,185,${(0.5+0.5*dewBoost).toFixed(3)})`;
    ctx.fill();
    ctx.beginPath();ctx.arc(point.x,point.y,size+2.5*dewBoost,0,TAU);
    ctx.fillStyle=`rgba(200,169,110,${(0.35*dewBoost).toFixed(3)})`;
    ctx.fill();
   }else{
    ctx.fillStyle=`rgba(238,224,197,${.28+glint*.58})`;ctx.fill();
    if(glint>.7){ctx.beginPath();ctx.arc(point.x,point.y,size+2,0,TAU);ctx.fillStyle=`rgba(230,210,170,${glint*.045})`;ctx.fill();}
   }
  }));

  // Hub node with responsive brass core
  const anyHover=Math.max(...this.hoverLevels);
  ctx.fillStyle=anyHover>0.1?'#fff7e6':'#e6d2aa';
  ctx.beginPath();ctx.arc(this.cx,this.cy,1.5+1.2*anyHover,0,TAU);ctx.fill();
  if(anyHover>0.1){
   ctx.beginPath();ctx.arc(this.cx,this.cy,3.5+2*anyHover,0,TAU);
   ctx.fillStyle=`rgba(200,169,110,${(0.4*anyHover).toFixed(3)})`;ctx.fill();
  }
 }
}
