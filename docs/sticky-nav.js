(() => {
  const nav = document.querySelector('[data-sticky-index]');
  if (!nav) return;
  const main = nav.closest('main');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(a => document.getElementById(a.hash.slice(1)));
  const space = document.createElement('div');
  space.className = 'sticky-index-space';
  space.hidden = true;
  space.setAttribute('aria-hidden', 'true');
  nav.before(space);
  let stuck = false, scheduled = false, current = -1;
  function update() {
    scheduled = false;
    const anchor = (stuck ? space : nav).getBoundingClientRect();
    const shouldStick = anchor.top <= 0;
    if (shouldStick !== stuck) {
      if (shouldStick) {
        const style = getComputedStyle(nav);
        space.style.width = `${anchor.width}px`;
        space.style.height = `${anchor.height}px`;
        space.style.margin = style.margin;
      }
      space.hidden = !shouldStick;
      nav.classList.toggle('is-stuck', shouldStick);
      stuck = shouldStick;
    }
    if (stuck) {
      const rect = main.getBoundingClientRect(), style = getComputedStyle(main);
      const left = rect.left + parseFloat(style.paddingLeft);
      nav.style.setProperty('--index-left', `${left}px`);
      nav.style.setProperty('--index-width', `${rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)}px`);
    }
    let index = 0;
    sections.forEach((section,i) => { if (section && section.getBoundingClientRect().top <= 130) index = i; });
    if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 4) index = links.length - 1;
    if (index !== current) {
      current = index;
      links.forEach((a,i) => i === index ? a.setAttribute('aria-current','location') : a.removeAttribute('aria-current'));
      const r = links[index]?.getBoundingClientRect(), n = nav.getBoundingClientRect();
      if (r && (r.left < n.left || r.right > n.right)) nav.scrollTo({left:nav.scrollLeft+r.left-n.left-(n.width-r.width)/2,behavior:'instant'});
    }
  }
  function schedule() { if (!scheduled) {scheduled=true;requestAnimationFrame(update);} }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',() => {
    // Remeasure the menu in its natural layout after the page width changes.
    nav.classList.remove('is-stuck');space.hidden=true;stuck=false;current=-1;
    schedule();
  });
  addEventListener('load',schedule);
  update();
})();
