let active=null,pinned=false,timer;
function position(){if(!active)return;const r=active.querySelector('.npc-trigger').getBoundingClientRect(),box=active.querySelector('.npc-popover');let left=r.right+14;if(left+box.offsetWidth>innerWidth-12)left=r.left-box.offsetWidth-14;box.style.left=Math.max(12,Math.min(left,innerWidth-box.offsetWidth-12))+'px';box.style.top=Math.max(12,Math.min(r.top,innerHeight-box.offsetHeight-12))+'px'}
function close(returnFocus=false){clearTimeout(timer);if(!active)return;const card=active;active=null;pinned=false;card.querySelector('.npc-popover').hidden=true;card.querySelector('.npc-trigger').setAttribute('aria-expanded','false');if(returnFocus)card.querySelector('.npc-trigger').focus()}
function show(card){clearTimeout(timer);if(active!==card){close();active=card}card.querySelector('.npc-popover').hidden=false;card.querySelector('.npc-trigger').setAttribute('aria-expanded','true');position()}
for(const card of document.querySelectorAll('.npc-card:has(.npc-trigger)')){const trigger=card.querySelector('.npc-trigger'),box=card.querySelector('.npc-popover');trigger.addEventListener('mouseenter',()=>{if(innerWidth>650&&matchMedia('(hover:hover)').matches)show(card)});card.addEventListener('mouseleave',()=>{if(!pinned)timer=setTimeout(()=>close(),220)});box.addEventListener('mouseenter',()=>clearTimeout(timer));trigger.addEventListener('click',()=>{if(active===card&&pinned)close();else{show(card);pinned=true}});trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();show(card);pinned=true;box.querySelector('button').focus()}});box.querySelector('.npc-close').addEventListener('click',()=>close(true));card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget))close()})}
document.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close(true)});addEventListener('resize',()=>close());addEventListener('scroll',position,{passive:true});
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
  const albumRect=document.querySelector('#story-album')?.getBoundingClientRect();
  back.hidden=scrollY<Math.max(500,innerHeight*.6)||(albumRect&&albumRect.top<innerHeight&&albumRect.bottom>0);
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

// One work at a time; source links remain usable when JavaScript is unavailable.
(() => {
 const album=document.querySelector('.album-grid');
 if(!album||album.querySelector('.album-empty'))return;
 const slides=[...album.children],works=slides.filter(s=>s.querySelector('.album-art'));
 let index=0,playing=false,interval,opener,suppressClickUntil=0;
 const makeButton=(label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;return b};
 const controls=document.createElement('div');controls.className='album-controls';
 const count=document.createElement('span');count.className='album-count';count.setAttribute('role','status');
 const previous=makeButton('← 上一张',()=>step(-1)),next=makeButton('下一张 →',()=>step(1));
 const play=makeButton('播放轮播',()=>setPlaying(!playing));play.setAttribute('aria-pressed','false');
 const gridToggle=makeButton('查看全部',()=>{thumbs.hidden=!thumbs.hidden;gridToggle.setAttribute('aria-expanded',String(!thumbs.hidden))});
 const thumbs=document.createElement('div');thumbs.className='album-thumbnails';thumbs.id='album-thumbnails';thumbs.hidden=true;gridToggle.setAttribute('aria-controls',thumbs.id);gridToggle.setAttribute('aria-expanded','false');
 controls.append(previous,count,next,play,gridToggle);album.after(controls,thumbs);album.classList.add('album-carousel');album.setAttribute('aria-label','相册画册');
 const thumbButtons=slides.map((s,i)=>{const b=makeButton('',()=>{setPlaying(false);show(i)}),img=s.querySelector('.album-art img');b.setAttribute('aria-label',img?`查看第 ${i+1} 张：${img.alt}`:`第 ${i+1} 张尚未解锁`);if(img){const copy=img.cloneNode();copy.loading='lazy';copy.alt='';b.append(copy)}else b.textContent='未展卷';thumbs.append(b);return b});
 function show(i){index=(i+slides.length)%slides.length;slides.forEach((s,n)=>{s.hidden=n!==index});thumbButtons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===index)));count.textContent=`${index+1} / ${slides.length}`;if(viewer.open)showViewer()}
 function step(delta){setPlaying(false);show(index+delta)}
 function setPlaying(value){playing=value;clearInterval(interval);play.textContent=playing?'暂停轮播':'播放轮播';play.setAttribute('aria-pressed',String(playing));count.setAttribute('aria-live',playing?'off':'polite');if(playing)interval=setInterval(()=>show(index+1),5000)}
 for(const b of [previous,next,play,gridToggle])b.hidden=slides.length<2;
 album.addEventListener('focusin',()=>setPlaying(false));album.addEventListener('pointerdown',()=>setPlaying(false));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false)});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)setPlaying(false)}).observe(album);
 const viewer=document.createElement('dialog');viewer.className='album-viewer album-reader';viewer.setAttribute('aria-label','放大查看相册');
 const bar=document.createElement('div');bar.className='album-reader-bar';
 const caption=document.createElement('p');caption.className='album-reader-caption';
 const viewport=document.createElement('div');viewport.className='album-zoom-viewport';
 const image=document.createElement('img');image.draggable=false;viewport.append(image);
 const error=document.createElement('p');error.className='album-image-error';error.textContent='图片暂时无法显示，请稍后重试。';error.hidden=true;
 const closeButton=makeButton('关闭 ×',()=>viewer.close());
 const zoomButton=makeButton('放大',()=>zoom(scale===1?2:1));
 const viewPrev=makeButton('← 上一张',()=>viewerStep(-1)),viewNext=makeButton('下一张 →',()=>viewerStep(1));
 const hint=document.createElement('p');hint.className='album-reader-hint';hint.textContent='左右滑动翻页 · 双击或双指缩放 · 放大后拖动查看';
 bar.append(viewPrev,zoomButton,viewNext,closeButton);viewer.append(bar,viewport,error,caption,hint);document.body.append(viewer);
 viewPrev.hidden=viewNext.hidden=works.length<2;
 let scale=1,x=0,y=0;
 function paint(){image.style.transform=`translate(${x}px,${y}px) scale(${scale})`;zoomButton.textContent=scale>1?'还原':'放大';viewport.classList.toggle('is-zoomed',scale>1)}
 function zoom(value){scale=Math.max(1,Math.min(5,value));if(scale===1)x=y=0;paint()}
 function showViewer(){const link=slides[index].querySelector('.album-art');if(!link)return;opener=link;error.hidden=true;image.src=link.href;image.alt=link.querySelector('img').alt;caption.textContent=[...slides[index].querySelectorAll('figcaption > *')].map(node=>node.textContent).join(' · ')||image.alt;zoom(1)}
 function viewerStep(delta){const current=works.indexOf(slides[index]);show(slides.indexOf(works[(current+delta+works.length)%works.length]))}
 image.addEventListener('error',()=>{error.hidden=false});
 viewer.addEventListener('close',()=>{zoom(1);opener?.focus()});
 viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close()}});
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();viewerStep(e.key==='ArrowLeft'?-1:1)}});
 for(const link of album.querySelectorAll('.album-art'))link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();if(Date.now()<suppressClickUntil)return;setPlaying(false);opener=link;viewer.showModal();showViewer()});
 viewport.addEventListener('dblclick',e=>{e.preventDefault();zoom(scale===1?2:1)});
 // Pointer gestures support touch, pen, and dragging an enlarged picture.
 function gestures(target,enlarged){
  const points=new Map();let start,last,pinch=null,multi=false,moved=false,lastTap=0;
  target.addEventListener('pointerdown',e=>{if(e.button!==0)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===1){start=last={x:e.clientX,y:e.clientY};multi=false;moved=false}if(enlarged)target.setPointerCapture(e.pointerId);if(points.size===2){multi=true;const [a,b]=[...points.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),scale}}});
  target.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;const point={x:e.clientX,y:e.clientY};points.set(e.pointerId,point);if(Math.hypot(point.x-start.x,point.y-start.y)>8)moved=true;
   if(enlarged&&points.size===2&&pinch){const [a,b]=[...points.values()];zoom(pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance))}
   else if(enlarged&&scale>1&&!multi){x+=point.x-last.x;y+=point.y-last.y;paint()}last=point;
  });
  const finish=e=>{if(!points.has(e.pointerId))return;points.delete(e.pointerId);if(e.type==='pointercancel'){multi=true;return}if(points.size)return;
   const dx=e.clientX-start.x,dy=e.clientY-start.y;
   if(!multi&&(!enlarged||scale===1)&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){suppressClickUntil=Date.now()+400;enlarged?viewerStep(dx<0?1:-1):step(dx<0?1:-1)}
   else if(enlarged&&!multi&&!moved&&e.pointerType==='touch'){const now=Date.now();if(now-lastTap<300){zoom(scale===1?2:1);lastTap=0}else lastTap=now}
  };
  target.addEventListener('pointerup',finish);target.addEventListener('pointercancel',finish);target.addEventListener('pointerleave',e=>{if(!enlarged)points.delete(e.pointerId)});
 }
 gestures(album,false);gestures(viewport,true);show(0);
})();
