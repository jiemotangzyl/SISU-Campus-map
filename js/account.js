import{initBgFloat}from'./bgfloat.js?v=20261026-bg';
import{initRibbon}from'./ribbon.js?v=20261026-rb4';
// 右上角管理员入口：圆形头像按钮 + 登录浮层；登录后导航里才出现「相册管理」
import{hasPhotoBackend,photoFetch,saveAdminToken}from'./photo-api.js?v=20261023-sync';
initBgFloat();
const header=document.querySelector('header'),nav=header&&header.querySelector('nav');
if(header&&nav){
  if(!header.querySelector('.hdr-fx')){
    const fx=document.createElement('div');fx.className='hdr-fx';fx.setAttribute('aria-hidden','true');
    const S=[[8,28,12,0,5.2],[19,66,8,1.7,4.6],[31,22,10,3.1,5.8],[44,72,7,.9,4.2],[57,30,13,2.4,6.2],[68,64,9,4.0,4.8],[79,24,11,1.2,5.6],[88,70,8,3.5,4.4],[94,34,10,5.0,5.0]];
    fx.innerHTML='<b class="hdr-sweep"></b>'+S.map(([x,y,s,d,t])=>`<i style="left:${x}%;top:${y}%;--s:${s}px;--d:${d}s;--t:${t}s"></i>`).join('');
    header.prepend(fx);initRibbon(fx);
  }

  const wrap=document.createElement('div');wrap.className='account';
  wrap.innerHTML=`<button type="button" class="account-btn" aria-label="管理员登录" aria-haspopup="dialog" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.6-3.7 3.6-5.9 7.2-5.9s6.6 2.2 7.2 5.9"/></svg><i class="account-dot" hidden></i></button>
<div class="account-pop" role="dialog" aria-label="管理员账户" hidden>
<form class="account-login" autocomplete="off"><span class="eyebrow">ADMIN</span><h2>管理员登录</h2><p>仅限相册管理员，游客无需登录。</p><label for="account-password">管理员密码</label><input id="account-password" type="password" autocomplete="current-password" required><button class="button" type="submit">登录</button></form>
<div class="account-in" hidden><span class="eyebrow">ADMIN</span><h2>已登录管理员</h2><p>导航栏已显示「相册管理」。</p><a class="button" href="admin.html">进入相册管理</a><button class="button secondary" type="button" data-logout>退出登录</button></div>
<p class="account-msg" role="status" aria-live="polite"></p></div>`;
  header.append(wrap);
  const $=s=>wrap.querySelector(s),btn=$('.account-btn'),pop=$('.account-pop'),form=$('.account-login'),inView=$('.account-in'),msg=$('.account-msg'),input=$('#account-password'),dot=$('.account-dot');
  const onAdmin=/admin\.html$/.test(location.pathname);
  let authed=false,tab=null;
  const say=t=>{msg.textContent=t||'';};
  const setOpen=v=>{pop.hidden=!v;btn.setAttribute('aria-expanded',String(v));if(v)(authed?inView.querySelector('a'):input).focus();};
  function setAuth(v,animate=true){
    authed=v;wrap.classList.toggle('is-admin',v);dot.hidden=!v;form.hidden=v;inView.hidden=!v;btn.setAttribute('aria-label',v?'管理员账户':'管理员登录');
    if(v&&!tab){tab=document.createElement('a');tab.href='admin.html';tab.textContent='相册管理';tab.className=(animate?"nav-enter":"")+(onAdmin?" active":"");if(onAdmin)tab.setAttribute('aria-current','page');nav.append(tab);}
    if(!v&&tab){tab.remove();tab=null;}
  }
  async function call(path,method,body){
    const res=await photoFetch(path,{method,cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
    let d={};try{d=await res.json();}catch{}
    if(!res.ok)throw Error(d.message||'操作失败，请重试。');return d;
  }
  async function check(){
    let token='';try{token=sessionStorage.getItem('sisu-photo-admin')||'';}catch{}
    if(!token||!hasPhotoBackend){setAuth(false);return;}
    try{const s=await call('/api/admin/session');if(!s.authenticated)saveAdminToken('');setAuth(!!s.authenticated);}catch{setAuth(false);}
  }
  btn.addEventListener('click',e=>{e.stopPropagation();setOpen(pop.hidden);});
  pop.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',()=>{if(!pop.hidden)setOpen(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){setOpen(false);btn.focus();}});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!hasPhotoBackend){say('登录服务暂时不可用。');return;}
    const go=form.querySelector('button');go.disabled=true;say('正在验证…');
    try{const r=await call('/api/admin/login','POST',{password:input.value});saveAdminToken(r.token);input.value='';say('');await check();if(onAdmin)location.reload();else setOpen(true);}
    catch(err){say(err.message);input.select();}finally{go.disabled=false;}
  });
  wrap.querySelector('[data-logout]').addEventListener('click',async()=>{
    try{await call('/api/admin/logout','POST',{});}catch{}
    saveAdminToken('');setAuth(false);setOpen(false);if(onAdmin)location.reload();
  });
  try{if(sessionStorage.getItem("sisu-photo-admin"))setAuth(true,false);}catch{}
  addEventListener("sisu-admin-change",check);
  check();
}
