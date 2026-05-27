const startScreen=document.getElementById("startScreen");
const gameScreen=document.getElementById("gameScreen");
const gameOverScreen=document.getElementById("gameOverScreen");
const startBtn=document.getElementById("startBtn");
const restartBtn=document.getElementById("restartBtn");
const scoreEl=document.getElementById("score");
const bestEl=document.getElementById("best");
const finalScoreEl=document.getElementById("finalScore");
const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");

let cw=0,ch=0,dpr=1;
let running=false,frame=0,score=0,speed=5;
let best=Number(localStorage.getItem("x19_best")||0);
let girl,obstacles=[],fragments=[],particles=[];
bestEl.textContent=best;

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  cw=window.innerWidth; ch=window.innerHeight;
  canvas.width=Math.floor(cw*dpr); canvas.height=Math.floor(ch*dpr);
  canvas.style.width=cw+"px"; canvas.style.height=ch+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize",resize);
resize();

function show(s){[startScreen,gameScreen,gameOverScreen].forEach(x=>x.classList.remove("active"));s.classList.add("active");}

function reset(){
  frame=0;score=0;speed=5;obstacles=[];fragments=[];particles=[];
  girl={x:72,y:ch-160,w:44,h:66,vy:0,gravity:.78,jump:-15.5,grounded:false};
  scoreEl.textContent=0;
}

function start(){reset();show(gameScreen);running=true;requestAnimationFrame(loop);}
function jump(){
  if(!running)return;
  if(girl.grounded){
    girl.vy=girl.jump; girl.grounded=false;
    burst(girl.x+20,girl.y+girl.h,12);
  }
}
function gameOver(){
  if(!running)return;
  running=false;
  finalScoreEl.textContent=score;
  if(score>best){best=score;localStorage.setItem("x19_best",best);bestEl.textContent=best;}
  show(gameOverScreen);
}

function addObstacle(){
  const size=42+Math.random()*10;
  obstacles.push({x:cw+50,y:ch-91-size,w:size,h:size});
}
function addFragment(){
  fragments.push({x:cw+40,y:ch-210-Math.random()*130,s:16});
}
function burst(x,y,n){
  for(let i=0;i<n;i++)particles.push({x,y,vx:-1-Math.random()*4,vy:-Math.random()*5,life:28});
}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

function update(){
  frame++; score++; scoreEl.textContent=score;
  speed=5+Math.min(5,Math.floor(score/700));
  const ground=ch-88;

  girl.vy+=girl.gravity; girl.y+=girl.vy;
  if(girl.y+girl.h>=ground){girl.y=ground-girl.h;girl.vy=0;girl.grounded=true;}

  if(frame%82===0)addObstacle();
  if(frame%135===0)addFragment();

  obstacles.forEach(o=>o.x-=speed);
  fragments.forEach(f=>f.x-=speed);
  obstacles=obstacles.filter(o=>o.x+o.w>-30);
  fragments=fragments.filter(f=>f.x+f.s>-30);

  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life--;});
  particles=particles.filter(p=>p.life>0);

  for(const o of obstacles){if(hit(girl,o))gameOver();}
  for(let i=fragments.length-1;i>=0;i--){
    const f=fragments[i];
    if(hit(girl,{x:f.x-f.s,y:f.y-f.s,w:f.s*2,h:f.s*2})){
      score+=160; burst(f.x,f.y,18); fragments.splice(i,1);
    }
  }
}

function bg(){
  ctx.fillStyle="#10070a";ctx.fillRect(0,0,cw,ch);
  const grad=ctx.createRadialGradient(cw*.72,95,20,cw*.72,95,210);
  grad.addColorStop(0,"rgba(150,18,52,.42)");
  grad.addColorStop(1,"rgba(150,18,52,0)");
  ctx.fillStyle=grad;ctx.fillRect(0,0,cw,ch);

  ctx.fillStyle="rgba(244,234,223,.07)";
  for(let i=0;i<45;i++){
    const x=(i*91+frame*.35)%cw;
    const y=38+(i*57)%(ch-170);
    ctx.fillRect(x,y,2,2);
  }

  ctx.fillStyle="#2a1016";ctx.fillRect(0,ch-88,cw,88);
  ctx.fillStyle="rgba(244,234,223,.2)";ctx.fillRect(0,ch-90,cw,2);

  ctx.fillStyle="rgba(0,0,0,.22)";
  for(let i=0;i<5;i++){
    const x=((i*160)-(frame*speed*.35))%(cw+180)-80;
    ctx.fillRect(x,ch-76,90,8);
  }
}

function drawGirl(){
  const x=girl.x,y=girl.y;
  ctx.save();
  ctx.shadowColor="rgba(244,234,223,.25)";ctx.shadowBlur=14;

  ctx.fillStyle="#f4eadf";
  ctx.beginPath();ctx.arc(x+22,y+18,17,0,Math.PI*2);ctx.fill();

  ctx.fillStyle="#2a0b10";
  ctx.beginPath();ctx.arc(x+16,y+10,15,Math.PI*.95,Math.PI*1.9);ctx.arc(x+30,y+10,15,Math.PI*1.1,Math.PI*2.05);ctx.fill();

  ctx.fillStyle="#7b1026";ctx.fillRect(x+8,y+34,30,31);
  ctx.fillStyle="#0b0809";ctx.fillRect(x+9,y+16,27,5);
  ctx.fillRect(x+13,y+18,7,7);ctx.fillRect(x+26,y+18,7,7);

  ctx.fillStyle="#f4eadf";ctx.fillRect(x+10,y+64,8,20);ctx.fillRect(x+28,y+64,8,20);
  ctx.fillStyle="rgba(244,234,223,.78)";ctx.font="bold 11px Arial";ctx.fillText("X19",x+8,y-8);
  ctx.restore();
}

function roundRect(x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function drawObstacles(){
  obstacles.forEach(o=>{
    ctx.save();
    ctx.fillStyle="#f4eadf";
    roundRect(o.x,o.y+8,o.w,o.h,12);ctx.fill();
    ctx.beginPath();
    ctx.ellipse(o.x+o.w*.28,o.y+5,6,18,-.25,0,Math.PI*2);
    ctx.ellipse(o.x+o.w*.72,o.y+5,6,18,.25,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#111";ctx.fillRect(o.x+o.w*.22,o.y+24,7,7);ctx.fillRect(o.x+o.w*.62,o.y+24,7,7);
    ctx.fillStyle="#7b1026";ctx.fillRect(o.x+o.w*.34,o.y+38,o.w*.32,4);
    ctx.restore();
  });
}

function drawFragments(){
  fragments.forEach(f=>{
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(frame*.04);
    ctx.fillStyle="#b51d3b";
    ctx.beginPath();ctx.moveTo(0,-f.s);ctx.lineTo(f.s,0);ctx.lineTo(0,f.s);ctx.lineTo(-f.s,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(244,234,223,.75)";ctx.stroke();
    ctx.restore();
  });
}

function drawParticles(){
  particles.forEach(p=>{
    ctx.fillStyle=`rgba(244,234,223,${p.life/28})`;
    ctx.fillRect(p.x,p.y,3,3);
  });
}

function loop(){
  if(!running)return;
  update(); bg(); drawFragments(); drawGirl(); drawObstacles(); drawParticles();
  requestAnimationFrame(loop);
}

startBtn.addEventListener("click",start);
restartBtn.addEventListener("click",start);
window.addEventListener("pointerdown",()=>{if(gameScreen.classList.contains("active"))jump();});
window.addEventListener("keydown",e=>{if(e.code==="Space")jump();});

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
}
