import{esc}from'./data.js?v=20261020-latest';
const $=id=>document.getElementById(id);let photos=[],visible=[],category='全部',current=0,opener=null;
function photoURL(src){try{const u=new URL(src,location.href);return u.origin===location.origin&&(u.pathname.includes('/assets/scenery/')||/^\/user-photos\/[a-f0-9]{32}\.jpg$/.test(u.pathname))&&['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
function meta(p){return[p.location,p.taken_at,p.photographer?'摄影 / '+p.photographer:''].filter(Boolean).join(' · ');}
function render(){
  const cats=['全部',...new Set(photos.map(p=>p.category).filter(Boolean))];
  $('scenery-filters').hidden=!photos.length;$('scenery-total').textContent=photos.length?`${photos.length} 帧风景`:'';
  $('scenery-filters').innerHTML=cats.map(c=>`<button data-category="${esc(c)}" aria-pressed="${c===category}">${esc(c)}</button>`).join('');
  visible=photos.filter(p=>category==='全部'||p.category===category);
  $('scenery-empty').hidden=photos.length>0;
  $('scenery-wall').innerHTML=visible.map((p,i)=>`<button class="scenery-card" data-photo="${i}" aria-label="查看大图：${esc(p.title||'校园风景')}"><img src="${esc(p.url)}" alt="${esc(p.alt||p.title||'校园风景')}" loading="lazy" decoding="async"${p.width&&p.height?` width="${p.width}" height="${p.height}"`:''}><span class="scenery-card-copy"><b>${esc(p.title||'校园风景')}</b>${meta(p)?`<small>${esc(meta(p))}</small>`:''}</span></button>`).join('');
  $('scenery-wall').querySelectorAll('img').forEach(img=>img.onerror=()=>{img.removeAttribute('src');img.alt='照片暂时无法加载';});
}
function show(i){
  if(!visible.length)return;current=(i+visible.length)%visible.length;const p=visible[current];
  $('scenery-image').hidden=false;$('scenery-image-error').hidden=true;$('scenery-image').src=p.url;$('scenery-image').alt=p.alt||p.title||'校园风景';
  $('scenery-counter').textContent=`${current+1} / ${visible.length}`;$('scenery-view-title').textContent=p.title||'校园风景';$('scenery-view-meta').textContent=meta(p);$('scenery-view-description').textContent=p.description||'';
  $('scenery-prev').disabled=$('scenery-next').disabled=visible.length<2;
  const u=new URL(location.href);u.searchParams.set('photo',p.id);history.replaceState(null,'',u);
}
function open(i,button){opener=button;show(i);if(!$('scenery-viewer').open)$('scenery-viewer').showModal();}
$('scenery-filters').onclick=e=>{const b=e.target.closest('button[data-category]');if(b){category=b.dataset.category;render();}};
$('scenery-wall').onclick=e=>{const b=e.target.closest('[data-photo]');if(b)open(Number(b.dataset.photo),b);};
$('scenery-close').onclick=()=>$('scenery-viewer').close();$('scenery-prev').onclick=()=>show(current-1);$('scenery-next').onclick=()=>show(current+1);
$('scenery-viewer').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}});
$('scenery-viewer').addEventListener('click',e=>{if(e.target===$('scenery-viewer')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('scenery-viewer').addEventListener('close',()=>{const u=new URL(location.href);u.searchParams.delete('photo');history.replaceState(null,'',u);$('scenery-image').removeAttribute('src');opener?.focus();});
$('scenery-image').onerror=()=>{$('scenery-image').hidden=true;$('scenery-image-error').hidden=false;};
try{const res=await fetch('data/scenery_photos.json',{cache:'no-cache'});if(!res.ok)throw Error('读取失败');const data=await res.json();try{if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname))throw Error('Static hosting');const uploaded=await fetch('/api/photos',{cache:'no-store',signal:AbortSignal.timeout(4000)});if(uploaded.ok){const extra=await uploaded.json();if(Array.isArray(extra.photos))data.photos=[...extra.photos,...data.photos];}}catch{}if(!Array.isArray(data.photos))throw Error('格式错误');const ids=new Set();photos=data.photos.filter(p=>p.id&&!ids.has(p.id)&&ids.add(p.id)&&p.public_use===true&&photoURL(p.src)).map(p=>({...p,url:photoURL(p.src),width:Number.isInteger(p.width)&&p.width>0?p.width:null,height:Number.isInteger(p.height)&&p.height>0?p.height:null}));$('scenery-status').hidden=true;render();const id=new URL(location.href).searchParams.get('photo'),i=visible.findIndex(p=>p.id===id);if(i>=0)open(i,null);}catch{$('scenery-status').textContent='校园影像暂时无法打开，请刷新后重试。';}

globalThis.addEventListener?.('pageshow',e=>{if(e.persisted)location.reload();});
