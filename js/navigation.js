import{CONFIG}from'./config.js?v=20261020-latest';
import{esc,isLocated}from'./data.js?v=20261020-latest';
export function navigationTarget(f,data){
  const seen=new Set();let target=f;
  while(target&&!seen.has(target.id)){
    seen.add(target.id);if(isLocated(target))return target;
    target=data.find(p=>p.id===target.parent_id);
  }
  return null;
}
export function routeURL(target,origin=null){
  if(!target||!isLocated(target)||origin&&!isLocated(origin))return null;
  const u=new URL('https://apis.map.qq.com/uri/v1/routeplan');
  u.search=new URLSearchParams({type:'walk',from:origin?origin.name:'我的位置',fromcoord:origin?`${origin.latitude},${origin.longitude}`:'CurrentLocation',to:target.name,tocoord:`${target.latitude},${target.longitude}`,policy:'0',referer:CONFIG.tencentKey}).toString();return u.href;
}
export function navigationPanel(f,data){
  const target=navigationTarget(f,data);if(!target)return '';
  const starts=data.filter(isLocated).filter(p=>p.id!==target.id);
  return `<section class="panel navigation-panel"><span class="eyebrow">LET'S WALK</span><h2>步行导航</h2><p class="navigation-destination">目的地：<b>${esc(target.name)}</b>${target.id!==f.id?'（所属建筑或场地）':''}</p><label class="navigation-label" for="navigation-origin">从哪里出发</label><select id="navigation-origin"><option value="current">我的位置</option>${starts.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select><a class="button navigation-button" id="navigation-go" href="${esc(routeURL(target))}" target="_blank" rel="noopener noreferrer">导航到这里 <span aria-hidden="true">↗</span></a><p class="navigation-help">在腾讯地图中查看步行路线。也可选择校园建筑作为起点。</p></section>`;
}
export function bindNavigation(f,data){
  const select=document.getElementById('navigation-origin'),link=document.getElementById('navigation-go');if(!select||!link)return;
  const target=navigationTarget(f,data);
  select.onchange=()=>{const origin=select.value==='current'?null:data.find(p=>p.id===select.value);const url=routeURL(target,origin);if(url)link.href=url;};
}
