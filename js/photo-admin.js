import{esc}from'./data.js?v=20261020-latest';
const $=id=>document.getElementById(id);let authenticated=false;
async function request(path,method='GET',body){const res=await fetch(path,{method,cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const d=await res.json();if(!res.ok)throw Error(d.message||'操作失败，请重试。');return d;}
async function render(){
  const session=await request('/api/admin/session');authenticated=session.authenticated;$('admin-login').hidden=authenticated;$('admin-library').hidden=!authenticated;
  if(!authenticated){$('admin-photos').innerHTML='';$('admin-status').textContent='请使用管理员密码登录。';return;}
  const d=await request('/api/photos');$('admin-status').textContent='已登录，删除照片后会从照片墙移除。';$('admin-count').textContent=`${d.photos.length} 张上传照片`;
  $('admin-photos').innerHTML=d.photos.length?d.photos.map(p=>`<article class="admin-photo"><img src="${esc(p.src)}" alt="${esc(p.title)}" loading="lazy"><div><h2>${esc(p.title)}</h2><p>${esc(p.category)} · ${esc(p.uploaded_at)}</p><button class="admin-delete" data-delete="${esc(p.photo_id)}">删除照片</button></div></article>`).join(''):'<div class="panel"><p>还没有上传照片。点击“添加照片”，分享第一帧校园风景。</p></div>';
}
$('admin-login').onsubmit=async e=>{e.preventDefault();try{await request('/api/admin/login','POST',{password:$('admin-password').value});$('admin-password').value='';await render();}catch(e){$('admin-status').textContent=e.message;}};
$('admin-logout').onclick=async()=>{try{await request('/api/admin/logout','POST',{});await render();}catch(e){$('admin-status').textContent=e.message;}};
$('admin-refresh').onclick=()=>render().catch(e=>$('admin-status').textContent=e.message);
$('admin-photos').onclick=async e=>{const b=e.target.closest('[data-delete]');if(!b||!authenticated||!confirm('确定删除这张照片？删除后将从公开照片墙移除。'))return;b.disabled=true;try{await request('/api/photos/'+encodeURIComponent(b.dataset.delete),'DELETE',{});await render();}catch(e){$('admin-status').textContent=e.message;b.disabled=false;}};
if(['localhost','127.0.0.1','[::1]'].includes(location.hostname)){try{await render();}catch{$('admin-status').textContent='相册管理服务暂未开放。';}}else{$('admin-status').textContent='相册管理服务暂未开放。';}
