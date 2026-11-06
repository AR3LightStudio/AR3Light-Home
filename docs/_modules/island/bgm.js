(()=>{'use strict';
const config=document.currentScript.dataset, player=new Audio(config.src);player.loop=true;player.preload='metadata';player.volume=.25;
const read=(key)=>{try{return localStorage.getItem(key)}catch{return null}},write=(key,v)=>{try{localStorage.setItem(key,v)}catch{}};
const key='third-lamp-music',positionKey=key+':'+config.group+':'+config.title;
let paused=read(key)==='paused',loading=false;
const box=document.createElement('aside');box.className='site-music';box.setAttribute('aria-label','背景音乐');
const button=document.createElement('button');button.type='button';button.className='site-music-toggle';button.textContent='♫';
const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='曲目';
const panel=document.createElement('div');panel.className='site-music-panel';
const title=document.createElement('strong');title.textContent=config.title;
const credit=document.createElement('p');credit.textContent=config.credit;
const link=document.createElement('a');link.href=config.source||'#';link.textContent='音乐来源';link.target='_blank';link.rel='noopener';link.hidden=!config.source;
const license=document.createElement('a');license.href='https://creativecommons.org/licenses/by/4.0/';license.textContent='CC BY 4.0';license.target='_blank';license.rel='noopener';license.hidden=!config.credit.includes('CC BY 4.0');
const label=document.createElement('label');label.textContent='音量 ';const volume=document.createElement('input');volume.type='range';volume.min=0;volume.max=1;volume.step=.05;volume.value=.25;volume.setAttribute('aria-label','背景音乐音量');volume.oninput=()=>player.volume=Number(volume.value);label.append(volume);
panel.append(title,credit,link,document.createTextNode(' '),license,label);details.append(summary,panel);box.append(button,details);document.body.append(box);
function update(message){const playing=!player.paused;button.dataset.playing=String(playing);button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',message||(playing?'暂停背景音乐':'播放背景音乐'));button.title=message||(playing?'暂停音乐':'播放音乐');}
async function play(){if(loading)return;loading=true;try{await player.play();paused=false;write(key,'playing');update()}catch(e){update(e.name==='NotAllowedError'?'浏览器未允许自动播放，点击播放音乐':'音乐暂时无法播放，点击重试')}finally{loading=false}}
button.onclick=()=>{if(loading)return;if(!player.paused){paused=true;player.pause();write(key,'paused');update()}else play()};
player.addEventListener('loadedmetadata',()=>{const saved=Number(read(positionKey));if(saved>0&&Number.isFinite(player.duration))player.currentTime=saved%player.duration;});
let last=0;player.addEventListener('timeupdate',()=>{if(Date.now()-last>1000){write(positionKey,String(player.currentTime));last=Date.now()}});
window.addEventListener('pagehide',()=>write(positionKey,String(player.currentTime)));player.addEventListener('play',()=>update());player.addEventListener('pause',()=>update());player.addEventListener('error',()=>update('音乐加载失败，点击重试'));
update();if(!paused)play();
})();
