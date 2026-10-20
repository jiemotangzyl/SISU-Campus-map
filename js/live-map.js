import{createLocationFilter}from'./location-filter.js?v=20261020-release';
const INTERVAL=20000;
export function startLiveMap(map){
  const $=id=>document.getElementById(id);
  if(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)){
    $('live-start').hidden=true;$('live-demo').hidden=true;$('live-stop').hidden=true;
    $('live-status').textContent='匿名位置共享暂未开放。';
    $('live-count').textContent='';
    document.querySelector('.live-local').textContent='功能预览';
    document.querySelector('.live-note').textContent='校园地图、设施详情和校园风景可正常浏览。';
    return;
  }
  const layer=new TMap.MultiMarker({id:'anonymous-presence',map,styles:{person:new TMap.MarkerStyle({width:14,height:14,anchor:{x:7,y:7},src:'assets/brand/person-dot.svg'}),self:new TMap.MarkerStyle({width:18,height:18,anchor:{x:9,y:9},src:'assets/brand/self-dot.svg'})},geometries:[]});
  let active=false,mode='live',generation=0,busy=false,points=[],self=null,expiry=0;
  let token='';
  let demoPosition=null;
  let filterLocation=createLocationFilter();
  const status=text=>{$('live-status').textContent=text;};
  function draw(){
    const now=performance.now();
    const geometries=points.filter(p=>p.expires>now).map((p,i)=>({id:'anonymous-'+i,styleId:'person',position:new TMap.LatLng(p.lat,p.lng)}));
    if(self&&expiry>now)geometries.push({id:'my-location',styleId:'self',position:new TMap.LatLng(self.lat,self.lng)});
    layer.setGeometries(geometries);
    $('live-count').textContent=active?`${geometries.length} 个共享小点${mode==='demo'?' · 模拟体验':''}`:'';
  }
  async function api(method,body,session=token){
    const res=await fetch('/api/presence',{method,headers:{Authorization:'Bearer '+session,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(12000)});
    const payload=await res.json();if(!res.ok)throw Error(payload.message||'共享服务暂时不可用');return payload;
  }
  function locate(){return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(Error('此浏览器不支持定位，可以使用模拟体验。'));return;}
    navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,timestamp:p.timestamp}),e=>reject(Error(e.code===1?'定位未获授权，未共享你的位置。':e.code===3?'定位超时，可重试或使用模拟体验。':'暂时无法获取位置，可使用模拟体验。')),{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });}
  async function update(){
    if(!active||document.hidden||busy)return;
    busy=true;const g=generation;
    try{
      const position=mode==='demo'?{...demoPosition,timestamp:Date.now()}:filterLocation(await locate());
      if(!active||g!==generation||document.hidden)return;
      const sent=performance.now();const result=await api('PUT',{lat:position.lat,lng:position.lng,timestamp:position.timestamp,mode});const elapsed=performance.now()-sent;
      if(!active||g!==generation||document.hidden)return;
      self=result.self;expiry=performance.now()+Math.max(0,result.ttlMs-elapsed);
      points=result.points.map(p=>({...p,expires:performance.now()+Math.max(0,p.ttlMs-elapsed)}));draw();
      status(mode==='demo'?'模拟共享中 · 小点代表体验会话，不是真实用户位置':`匿名共享中 · 设备报告误差约±${Math.round(position.accuracy)}米 · 约20秒更新`);
    }catch(e){
      if(g===generation&&active){status(e.message);if(!self)await stop(false);}
    }finally{busy=false;}
  }
  async function stop(showMessage=true){
    active=false;generation++;self=null;points=[];expiry=0;draw();
    $('live-start').disabled=false;$('live-demo').disabled=false;$('live-stop').hidden=true;
    try{await api('DELETE');if(showMessage)status('共享已关闭，位置已移除。');}
    catch{if(showMessage)status('本机已停止共享；网络恢复后移除，原位置最多保留60秒。');}
  }
  function begin(nextMode){
    if(active)return;mode=nextMode;generation++;active=true;token=crypto.randomUUID()+crypto.randomUUID();filterLocation=createLocationFilter();
    demoPosition={lat:31.046214+(Math.random()-.5)*.003,lng:121.225337+(Math.random()-.5)*.003};
    $('live-start').disabled=true;$('live-demo').disabled=true;$('live-stop').hidden=false;
    status(mode==='demo'?'正在连接模拟体验…':'正在请求定位授权…');update();
  }
  $('live-start').disabled=false;$('live-demo').disabled=false;
  $('live-start').onclick=()=>begin('live');$('live-demo').onclick=()=>begin('demo');$('live-stop').onclick=()=>stop();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){points=[];draw();if(active)status('后台已暂停更新，位置将在最后更新60秒后消失。');}else if(active)update();});
  window.addEventListener('pagehide',()=>{active=false;generation++;fetch('/api/presence',{method:'DELETE',headers:{Authorization:'Bearer '+token},keepalive:true}).catch(()=>{});});
  // A one-second local clock expires points without making network requests.
  setInterval(draw,1000);setInterval(update,INTERVAL);
  status('共享默认关闭。开启后，仅向同样开启共享的在线用户显示匿名小点。');
}
