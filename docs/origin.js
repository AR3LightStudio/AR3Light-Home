const viewer = document.querySelector('.art-viewer');
const art = viewer.querySelector('.viewer-image');
const caption = viewer.querySelector('#viewer-caption');
const error = viewer.querySelector('.viewer-error');
let opener;
for (const link of document.querySelectorAll('[data-gallery]')) {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof viewer.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    caption.textContent = link.dataset.caption;
    art.alt = link.dataset.caption;
    art.hidden = false;
    error.hidden = true;
    error.querySelector('a').href = link.href;
    art.src = link.href;
    viewer.showModal();
  });
}
art.addEventListener('error', () => { art.hidden = true; error.hidden = false; });
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if(event.target === viewer) { const r = viewer.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) viewer.close(); }});
viewer.addEventListener('close', () => opener?.focus({preventScroll:true}));

// Keep the introduction open while the pointer travels into its panel.
const cards = [...document.querySelectorAll('.spirit-card')];
let activeCard, closeTimer, pinned = false;
function placeDetail() {
  if (!activeCard) return;
  const panel = activeCard.querySelector('.spirit-detail');
  const rect = activeCard.querySelector('.spirit-picture').getBoundingClientRect();
  const width = panel.offsetWidth, height = panel.offsetHeight;
  let left = rect.right + 12;
  if (left + width > innerWidth - 12) left = rect.left - width - 12;
  if (innerWidth < 650) left = (innerWidth - width) / 2;
  left = Math.max(12, Math.min(left, innerWidth - width - 12));
  const top = Math.max(12, Math.min(rect.top, innerHeight - height - 12));
  panel.style.left = `${left}px`; panel.style.top = `${top}px`;
}
function closeDetail(returnFocus = false) {
  clearTimeout(closeTimer);
  if (!activeCard) return;
  const card = activeCard; activeCard = null; pinned = false;
  card.querySelector('.spirit-detail').hidden = true;
  card.querySelector('.spirit-trigger').setAttribute('aria-expanded', 'false');
  if (returnFocus) card.querySelector('.spirit-trigger').focus({preventScroll:true});
}
function openDetail(card) {
  clearTimeout(closeTimer);
  if (activeCard !== card) { closeDetail(); activeCard = card; }
  card.querySelector('.spirit-detail').hidden = false;
  card.querySelector('.spirit-trigger').setAttribute('aria-expanded', 'true');
  placeDetail();
}
for (const card of cards) {
  const trigger = card.querySelector('.spirit-trigger');
  card.addEventListener('pointerenter', event => { if(event.pointerType === 'mouse' && innerWidth >= 650) openDetail(card); });
  card.addEventListener('pointerleave', event => {
    if(event.pointerType === 'mouse' && !pinned) closeTimer = setTimeout(() => closeDetail(), 220);
  });
  trigger.addEventListener('click', () => {
    if (activeCard === card && pinned) closeDetail();
    else { openDetail(card); pinned = true; }
  });
  trigger.addEventListener('keyup', event => { if(event.key === 'Tab') openDetail(card); });
  card.addEventListener('focusout', event => { if(!card.contains(event.relatedTarget)) closeDetail(); });
  card.querySelector('.detail-close').addEventListener('click', () => closeDetail(true));
}
document.addEventListener('keydown', event => { if(event.key === 'Escape' && activeCard) closeDetail(true); });
document.addEventListener('pointerdown', event => { if(activeCard && !activeCard.contains(event.target)) closeDetail(); });
window.addEventListener('resize', () => closeDetail());
window.addEventListener('scroll', placeDetail, {passive:true});

