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

// Local writing desk. Public visitors never see or load browser drafts.
if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
  const storageKey = 'third-lamp-spirit-drafts-v1';
  const fields = [['name','名字'],['kind','称呼'],['intro','介绍'],['interests','闲暇'],['lamp','象征之灯']];
  const limits = {name:20,kind:40,intro:3000,interests:300,motifs:300,lamp:300};
  const drafts = Object.fromEntries(cards.map(card => {
    const detail = card.querySelector('.spirit-detail');
    const facts = [...detail.querySelectorAll('dd')].map(el => el.textContent);
    return [card.id, {name:card.querySelector('.spirit-name').textContent,kind:detail.querySelector('small').textContent,intro:detail.querySelector('p').textContent,interests:facts[0],lamp:facts[1]}];
  }));
  function validDraft(value) {
    return value && cards.every(card => value[card.id] && fields.every(([key]) => typeof value[card.id][key] === 'string' && value[card.id][key].length <= limits[key]));
  }
  let initialNotice = '修改会自动保存到当前浏览器；尚未发布到朋友访问的网站。';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) { const value = JSON.parse(saved); if (!validDraft(value)) throw Error(); Object.assign(drafts,value); }
  } catch { initialNotice = '本地草稿未能读取。可导入备份，或重新修改并导出。'; }
  function applyDraft(id) {
    const card = document.getElementById(id), value = drafts[id];
    const detail = card.querySelector('.spirit-detail');
    card.querySelector('.spirit-name').textContent = value.name;
    card.querySelector('.spirit-sign > span:nth-child(2)').textContent = value.kind;
    const title = detail.querySelector('h3');
    title.replaceChildren(document.createTextNode(value.name));
    const small = document.createElement('small'); small.textContent = value.kind; title.append(small);
    detail.querySelector('p').textContent = value.intro;
    detail.querySelectorAll('dd').forEach((el,index) => el.textContent = value[['interests','lamp'][index]]);
    detail.setAttribute('aria-label', `${value.name}的介绍`);
    detail.querySelector('.detail-close').setAttribute('aria-label',`关闭${value.name}的介绍`);
  }
  cards.forEach(card => applyDraft(card.id));
  const launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'editor-launch'; launch.textContent = '编辑灯灵档案';
  document.querySelector('.archive-hint').after(launch);
  const desk = document.createElement('dialog'); desk.className = 'writing-desk'; desk.setAttribute('aria-labelledby','desk-title');
  desk.innerHTML = `<header class="desk-header"><div><h2 id="desk-title">灯灵档案 · 编辑</h2><p>自己改字，右侧实时预览。</p></div><button type="button" class="desk-close" aria-label="关闭编辑面板">完成 ×</button></header><div class="desk-layout"><form class="desk-form"><label>选择灯灵<select name="character"><option value="yin">寅 · 小虎灯</option><option value="yun">云 · 小兔灯</option><option value="he">禾 · 小鹿灯</option><option value="wu">午 · 小马灯</option></select></label>${fields.map(([key,label]) => `<label>${label}${key === 'intro' ? `<textarea name="${key}" rows="5" maxlength="${limits[key]}"></textarea>` : `<input name="${key}" maxlength="${limits[key]}">`}</label>`).join('')}</form><aside class="desk-preview"><p class="preview-label">介绍框预览</p><div class="preview-content"></div></aside></div><footer class="desk-footer"><p role="status" class="desk-status"></p><div><button type="button" class="desk-export">导出文字备份</button><button type="button" class="desk-import">导入备份</button><input class="desk-file" type="file" accept="application/json,.json" hidden></div><small>保存位置：这台设备的当前浏览器。清理浏览器数据会删除草稿，请导出备份留存。</small></footer>`;
  document.body.append(desk);
  const form = desk.querySelector('form'), status = desk.querySelector('.desk-status'), preview = desk.querySelector('.preview-content');
  let selected = 'yin'; status.textContent = initialNotice;
  function renderPreview() {
    const copy = document.getElementById(selected).querySelector('.spirit-detail').cloneNode(true);
    copy.removeAttribute('id'); copy.removeAttribute('hidden'); copy.removeAttribute('style'); copy.classList.add('preview-detail'); copy.querySelector('.detail-close').remove();
    preview.replaceChildren(copy);
  }
  function fillFields() { fields.forEach(([key]) => form.elements[key].value = drafts[selected][key]); renderPreview(); }
  function saveDraft() {
    try { localStorage.setItem(storageKey,JSON.stringify(drafts)); status.textContent = '已自动保存到本浏览器 · 未发布'; }
    catch { status.textContent = '浏览器未能保存，请点「导出文字备份」保留修改。'; }
  }
  launch.addEventListener('click', () => { closeDetail(); fillFields(); desk.showModal(); });
  desk.querySelector('.desk-close').addEventListener('click', () => desk.close());
  desk.addEventListener('close', () => launch.focus({preventScroll:true}));
  form.addEventListener('submit', event => event.preventDefault());
  form.elements.character.addEventListener('change', event => { selected = event.target.value; fillFields(); });
  form.addEventListener('input', event => {
    if (!fields.some(([key]) => key === event.target.name)) return;
    drafts[selected][event.target.name] = event.target.value;
    applyDraft(selected); renderPreview(); saveDraft();
  });
  desk.querySelector('.desk-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({version:1,characters:drafts},null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href=url; link.download='第三盏灯-灯灵档案文字备份.json'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const fileInput = desk.querySelector('.desk-file');
  desk.querySelector('.desk-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0]; if (!file) return;
    try {
      if(file.size > 100000) throw Error();
      const parsed = JSON.parse(await file.text());
      if(parsed.version !== 1 || !validDraft(parsed.characters)) throw Error();
      Object.assign(drafts,parsed.characters); cards.forEach(card => applyDraft(card.id)); fillFields(); saveDraft();
    } catch { status.textContent = '这份文件不是有效的灯灵文字备份，原有文字没有改变。'; }
    fileInput.value='';
  });
}
