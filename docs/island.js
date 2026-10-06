(() => {
 const book=document.querySelector('.species-book');
 if(book){
  const links=[...book.querySelectorAll('[data-species]')],pages=[...book.querySelectorAll('.species-page')];
  function select(id){const sea=book.querySelector('.species-sea');if(sea){const inside=!!sea.querySelector('[data-species="'+id+'"]');sea.classList.toggle('has-selection',inside);if(inside)sea.open=true}const page=pages.find(p=>p.id==='species-'+id);if(!page)return;for(const p of pages)p.hidden=p!==page;for(const a of links){if(a.dataset.species===id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')}}
  function fromHash(){const id=location.hash.replace('#species-','');select(links.some(a=>a.dataset.species===id)?id:links[0]?.dataset.species)}
  for(const a of links)a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();select(a.dataset.species);history.replaceState(null,'',a.hash)});
  addEventListener('hashchange',fromHash);fromHash();
 }
 const library=document.querySelector('.region-library');
 if(library){
  const map=document.querySelector('.island-map'),tooltip=map.querySelector('.map-tooltip'),zoom=document.querySelector('#map-zoom');
  const dialog=document.createElement('dialog');dialog.className='region-reader';dialog.setAttribute('aria-label','地域资料');
  const close=document.createElement('button');close.type='button';close.className='reader-close';close.textContent='关闭 ×';close.onclick=()=>dialog.close();
  const content=document.createElement('div');dialog.append(close,content);document.body.append(dialog);let opener;
  function show(id,source,changeHash=true){const original=document.getElementById('region-'+id);if(!original||!library.contains(original))return;opener=source||map.querySelector('[data-region="'+id+'"]');const clone=original.cloneNode(true);clone.removeAttribute('id');content.replaceChildren(clone);if(!dialog.open)dialog.showModal();dialog.scrollTop=0;tooltip.hidden=true;if(changeHash)history.pushState(null,'','#region-'+id)}
  dialog.addEventListener('close',()=>{if(location.hash.startsWith('#region-'))history.replaceState(null,'','#island-map');opener?.focus({preventScroll:true})});
  for(const a of map.querySelectorAll('[data-region]')){
   a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();show(a.dataset.region,a)});
   const preview=e=>{if(e.pointerType==='touch'||!matchMedia('(hover:hover)').matches)return;const r=document.getElementById('region-'+a.dataset.region);const strong=document.createElement('strong');strong.textContent=r.querySelector('h2').textContent;const note=document.createElement('span');note.textContent=r.querySelector('p').textContent.slice(0,68)+'…';tooltip.replaceChildren(strong,note);tooltip.hidden=false;tooltip.style.left=Math.max(12,Math.min(innerWidth-270,e.clientX+16))+'px';tooltip.style.top=Math.max(12,Math.min(innerHeight-tooltip.offsetHeight-12,e.clientY+16))+'px'};
   a.addEventListener('pointermove',preview);a.addEventListener('pointerleave',()=>tooltip.hidden=true);
  }
  zoom.hidden=false;zoom.setAttribute('aria-pressed','false');zoom.onclick=()=>{const on=map.querySelector('.map-scroll').classList.toggle('is-zoomed');zoom.textContent=on?'还原地图':'放大地图';zoom.setAttribute('aria-pressed',String(on))};
  library.hidden=true;
  function fromHash(){if(location.hash.startsWith('#region-'))show(location.hash.slice(8),null,false);else if(dialog.open)dialog.close()}
  addEventListener('popstate',fromHash);addEventListener('hashchange',fromHash);fromHash();
 }
 for(const link of document.querySelectorAll('.race-toc a'))link.onclick=()=>{const target=document.getElementById(link.hash.slice(1));if(target?.tagName==='DETAILS')target.open=true};
 const linked=document.getElementById(location.hash.slice(1));if(linked?.tagName==='DETAILS')linked.open=true;
 const photos=document.querySelectorAll('[data-island-image]');if(photos.length){const d=document.createElement('dialog');d.className='island-image-viewer';d.setAttribute('aria-label','图片查看器');const b=document.createElement('button');b.textContent='关闭 ×';b.onclick=()=>d.close();const img=document.createElement('img');d.append(b,img);document.body.append(d);let opener;d.addEventListener('close',()=>opener?.focus());for(const a of photos)a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();opener=a;img.src=a.href;img.alt=a.querySelector('img').alt;d.showModal()}}
})();

// Native popovers support click, touch, Escape and outside-click dismissal.
(()=>{for(const button of document.querySelectorAll('.elf-person-trigger')){const panel=document.getElementById(button.getAttribute('popovertarget'));let timer;const place=()=>{const box=button.getBoundingClientRect();const w=panel.offsetWidth,h=panel.offsetHeight;panel.style.left=Math.max(16,Math.min(innerWidth-w-16,box.left+box.width/2-w/2))+'px';panel.style.top=Math.max(16,Math.min(innerHeight-h-16,box.top-h-12))+'px'};panel.addEventListener('toggle',()=>{if(panel.matches(':popover-open'))place()});button.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||!matchMedia('(hover:hover)').matches)return;clearTimeout(timer);panel.showPopover();place()});const defer=()=>{timer=setTimeout(()=>panel.hidePopover(),220)};button.addEventListener('pointerleave',defer);panel.addEventListener('pointerenter',()=>clearTimeout(timer));panel.addEventListener('pointerleave',defer);button.addEventListener('click',()=>clearTimeout(timer));addEventListener('resize',()=>{if(panel.matches(':popover-open'))place()})}})();
