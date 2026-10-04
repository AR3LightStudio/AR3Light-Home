const sheet = document.querySelector('.place-sheet');
const controls = [...document.querySelectorAll('[data-place]')];
let anchor, timer, pinned=false;
function positionSheet(){
 if(!anchor || sheet.hidden)return;
 const r=anchor.getBoundingClientRect(), w=sheet.offsetWidth,h=sheet.offsetHeight;
 let x=r.right+10;if(x+w>innerWidth-12)x=r.left-w-10;
 sheet.style.left=`${Math.max(12,Math.min(x,innerWidth-w-12))}px`;
 sheet.style.top=`${Math.max(12,Math.min(r.top,innerHeight-h-12))}px`;
}
function closeSheet(focus=false){clearTimeout(timer);const old=anchor;anchor=null;pinned=false;sheet.hidden=true;controls.forEach(b=>b.setAttribute('aria-expanded','false'));if(focus)old?.focus({preventScroll:true});}
fetch('../content/yao.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(({places})=>{
 function show(button){
  clearTimeout(timer);if(anchor!==button)pinned=false;anchor=button;
  const index=Number(button.dataset.place),p=places[index];
  sheet.querySelector('.place-kind').textContent=`宣城 · ${p.kind==='镇'?'六镇':p.kind==='湖'?'湖泽':'八乡'}`;
  sheet.querySelector('.place-name').textContent=p.name;
  sheet.querySelector('.place-desc').textContent=p.desc;
  sheet.querySelector('.place-sites p').textContent=p.sites;
  controls.forEach(b=>b.setAttribute('aria-expanded',String(Number(b.dataset.place)===index)));
  sheet.hidden=false;positionSheet();
 }
 const leave=()=>{if(!pinned)timer=setTimeout(()=>closeSheet(),250);};
 controls.forEach(b=>{
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse' && innerWidth>650)show(b);});
  b.addEventListener('pointerleave',leave);
  b.addEventListener('click',()=>{if(anchor===b&&pinned)closeSheet();else{show(b);pinned=true;}});
  b.addEventListener('keyup',e=>{if(e.key==='Tab')show(b);});
 });
 sheet.addEventListener('pointerenter',()=>clearTimeout(timer));sheet.addEventListener('pointerleave',leave);
}).catch(()=>{controls.forEach(b=>b.disabled=true);document.querySelector('.map-caption>span').textContent='乡镇资料未能加载，请刷新重试。';});
sheet.querySelector('.place-close').addEventListener('click',()=>closeSheet(true));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden)closeSheet(true);});
document.addEventListener('pointerdown',e=>{if(!sheet.hidden&&!sheet.contains(e.target)&&!anchor?.contains(e.target))closeSheet();});
document.addEventListener('focusin',e=>{if(!sheet.hidden&&!sheet.contains(e.target)&&!controls.includes(e.target))closeSheet();});
window.addEventListener('resize',()=>closeSheet());window.addEventListener('scroll',positionSheet,{passive:true});
const mapViewer=document.querySelector('.map-viewer'),enlarge=document.querySelector('.map-enlarge');
enlarge.addEventListener('click',()=>{closeSheet();mapViewer.showModal();});mapViewer.querySelector('button').addEventListener('click',()=>mapViewer.close());mapViewer.addEventListener('close',()=>enlarge.focus({preventScroll:true}));
const links=[...document.querySelectorAll('.yao-nav a')];
function markSection(){let current=links[0];for(const link of links)if(document.querySelector(link.hash).getBoundingClientRect().top<innerHeight*.35)current=link;links.forEach(link=>{if(link===current)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});}
window.addEventListener('scroll',markSection,{passive:true});markSection();
