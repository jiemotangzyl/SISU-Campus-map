export function distance(a,b){const rad=Math.PI/180;const x=(b.lng-a.lng)*rad*Math.cos((a.lat+b.lat)*rad/2),y=(b.lat-a.lat)*rad;return 6371000*Math.hypot(x,y);}
// Poor fixes never renew the shared point's lifetime.
export function createLocationFilter(){
  let last=null,candidate=null;
  return position=>{
    const p={...position};
    if(!Number.isFinite(p.accuracy)||p.accuracy>80)throw Error('定位误差较大，本次未更新。建议到室外或使用手机重试；旧位置60秒后自动消失。');
    if(last&&p.timestamp<=last.timestamp)throw Error('未获得新位置，本次不更新。');
    if(last){
      const gap=(p.timestamp-last.timestamp)/1000,meters=distance(last,p);
      if(gap<90&&meters>Math.max(100,6*gap)){
        if(!candidate||distance(candidate,p)>40){candidate=p;throw Error('位置出现明显跳动，正在等待下一次定位确认。');}
      }
    }
    candidate=null;last=p;return p;
  };
}
