let active=null,pinned=false,timer;
function position(){if(!active)return;const r=active.querySelector('.npc-trigger').getBoundingClientRect(),box=active.querySelector('.npc-popover');let left=r.right+14;if(left+box.offsetWidth>innerWidth-12)left=r.left-box.offsetWidth-14;box.style.left=Math.max(12,Math.min(left,innerWidth-box.offsetWidth-12))+'px';box.style.top=Math.max(12,Math.min(r.top,innerHeight-box.offsetHeight-12))+'px'}
function close(returnFocus=false){clearTimeout(timer);if(!active)return;const card=active;active=null;pinned=false;card.querySelector('.npc-popover').hidden=true;card.querySelector('.npc-trigger').setAttribute('aria-expanded','false');if(returnFocus)card.querySelector('.npc-trigger').focus()}
function show(card){clearTimeout(timer);if(active!==card){close();active=card}card.querySelector('.npc-popover').hidden=false;card.querySelector('.npc-trigger').setAttribute('aria-expanded','true');position()}
for(const card of document.querySelectorAll('.npc-card:has(.npc-trigger)')){const trigger=card.querySelector('.npc-trigger'),box=card.querySelector('.npc-popover');trigger.addEventListener('mouseenter',()=>{if(innerWidth>650&&matchMedia('(hover:hover)').matches)show(card)});card.addEventListener('mouseleave',()=>{if(!pinned)timer=setTimeout(()=>close(),220)});box.addEventListener('mouseenter',()=>clearTimeout(timer));trigger.addEventListener('click',()=>{if(active===card&&pinned)close();else{show(card);pinned=true}});trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();show(card);pinned=true;box.querySelector('button').focus()}});box.querySelector('.npc-close').addEventListener('click',()=>close(true));card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget))close()})}
document.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close(true)});addEventListener('resize',()=>close());addEventListener('scroll',position,{passive:true});
const photos=document.querySelectorAll('.album-art');if(photos.length){const dialog=document.createElement('dialog');dialog.className='album-viewer';const button=document.createElement('button');button.textContent='关闭 ×';const img=document.createElement('img');dialog.append(button,img);document.body.append(dialog);let opener;button.onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});for(const a of photos)a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();opener=a;img.src=a.href;img.alt=a.querySelector('img').alt;dialog.showModal()})}

const chapterIndex=document.querySelector('.chapter-nav');
if(chapterIndex){
 const links=[...chapterIndex.querySelectorAll('a[href^="#"]')];
 const chapters=links.map(a=>document.querySelector(a.getAttribute('href')));
 const back=document.createElement('a');back.className='story-back-top';back.href='#main';back.textContent='回到卷首 ↑';back.hidden=true;document.body.append(back);
 let current=-1,scheduled=false;
 function updateReadingPosition(){
  scheduled=false;
  const rect=chapterIndex.getBoundingClientRect();
  chapterIndex.classList.toggle('is-stuck',rect.top<=1);
  back.hidden=scrollY<Math.max(500,innerHeight*.6);
  const anchorGap=(parseFloat(getComputedStyle(chapters[0]).scrollMarginTop)||0)+(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0);
  const threshold=Math.max(rect.height+28,anchorGap)+2;
  let index=0;
  chapters.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=threshold)index=i});
  if(scrollY>0&&scrollY+innerHeight>=document.documentElement.scrollHeight-4)index=links.length-1;
  if(index===current)return;current=index;
  links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  const selected=links[index],r=selected.getBoundingClientRect();
  if(r.left<rect.left||r.right>rect.right)chapterIndex.scrollTo({left:chapterIndex.scrollLeft+r.left-rect.left-(rect.width-r.width)/2,behavior:'instant'});
 }
 function scheduleReadingPosition(){if(!scheduled){scheduled=true;requestAnimationFrame(updateReadingPosition)}}
 addEventListener('scroll',scheduleReadingPosition,{passive:true});addEventListener('resize',scheduleReadingPosition);addEventListener('hashchange',scheduleReadingPosition);addEventListener('pageshow',scheduleReadingPosition);
 new ResizeObserver(scheduleReadingPosition).observe(document.querySelector('main'));
 updateReadingPosition();
}
