import {createFog} from './mist-fog.js';
const canvas=document.querySelector('#atmosphere');
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,last=0,w=0,h=0,lamp;
lamp={resize(){},render(){},source(){return{x:.505,y:.48}}};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let artBounds;
const fog=createFog(()=>draw(),canvas);
function resize(){w=canvas.clientWidth;h=canvas.clientHeight;const r=document.querySelector('.scene-art').getBoundingClientRect(),area=canvas.getBoundingClientRect();artBounds={x:r.left-area.left,y:r.top-area.top,width:r.width,height:r.height};fog.resize(w,h,artBounds);}
resize();addEventListener('resize',resize);
function draw(){fog.render(time);canvas.dataset.smokeTime=time.toFixed(3);}

let raf=0;
function frame(now){if(paused||document.hidden){raf=0;last=0;return;}time+=last ? Math.min((now-last)/1000,1) : 0;last=now;draw();raf=requestAnimationFrame(frame);}
function start(){if(!paused&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(frame);}}
const motion=document.querySelector('#motion');
function sync(){document.body.classList.toggle('paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'继续动效 <span>▷</span>':'暂停动效 <span>Ⅱ</span>';draw();start();}
motion.onclick=()=>{paused=!paused;sync()};
reduced.addEventListener('change',e=>{paused=e.matches;sync()});
document.addEventListener('visibilitychange',start);
document.querySelector('#replay').onclick=()=>{time=0;draw();document.querySelectorAll('.portal').forEach(e=>{e.style.animation='none';void e.offsetWidth;e.style.animation=''})};
addEventListener('resize',draw);sync();

// Keep ordinary link behavior for new tabs, keyboard access, and JS-free navigation.
document.querySelectorAll('a[data-world]').forEach(link=>link.addEventListener('click',async event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
 event.preventDefault();if(document.body.classList.contains('entering'))return;
 document.body.classList.add('entering');link.classList.add('summoning');
 if(!reduced.matches)await new Promise(resolve=>setTimeout(resolve,620));
 location.assign(link.href);
}));
addEventListener('pageshow',()=>{document.body.classList.remove('entering');document.querySelectorAll('.summoning').forEach(e=>e.classList.remove('summoning'));});
