// 页面背景的漂浮装饰：地图图钉、气泡、等高线、虚线路线上的小亮点；都在内容后面，很淡
const NS='http://www.w3.org/2000/svg';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function contour(cx,cy,r0,n,seed){
  let out='';
  for(let k=1;k<=n;k++){
    const pts=[];
    for(let i=0;i<=72;i++){
      const a=i/72*Math.PI*2,r=r0*k/n*(1+.12*Math.sin(a*3+seed)+.07*Math.sin(a*5-seed*1.7)+.04*Math.sin(a*2+seed*.6));
      pts.push((cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1));
    }
    out+=`<path d="M${pts.join('L')}Z" fill="none" stroke="#2a8fd8" stroke-opacity="${(.1+.02*k).toFixed(2)}" stroke-width="1"/>`;
  }
  return out;
}
const PIN=c=>`<svg viewBox="0 0 34 44" aria-hidden="true"><path d="M17 1C8 1 2 8 2 17c0 11 15 25 15 25s15-14 15-25C32 8 26 1 17 1z" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16" r="5" fill="#fff"/></svg>`;
export function initBgFloat(){
  if(document.querySelector('.bg-float'))return;
  const box=document.createElement('div');box.className='bg-float';box.setAttribute('aria-hidden','true');
  const pins=[[6,22,26,'#6fb7ec',0,7],[14,74,20,'#2a8fd8',1.5,8.5],[27,40,32,'#0673c6',3,9],[41,84,22,'#6fb7ec',.8,7.5],[58,18,24,'#2a8fd8',2.2,8],[72,66,30,'#0056a6',4,9.5],[86,30,22,'#6fb7ec',1.1,7],[93,78,26,'#2a8fd8',3.4,8.5]];
  const bubbles=[[8,0,70,46,-10,30],[19,0,34,32,-24,-20],[33,0,90,58,-30,40],[47,0,26,30,-6,-30],[61,0,56,44,-38,20],[76,0,40,36,-16,-24],[88,0,80,52,-44,36],[95,0,30,34,-20,-16]];
  const stars=[[12,52,14,0,5.5],[52,60,12,2.2,6.5],[80,14,16,3.6,6],[67,88,10,1,5]];
  box.innerHTML=
    `<svg class="bgf-contours" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice"><g class="bgf-c1">${contour(780,200,330,7,.4)}</g><g class="bgf-c2">${contour(160,820,300,6,2.1)}</g></svg>`
    +`<svg class="bgf-route" viewBox="0 0 1000 600" preserveAspectRatio="none"><path id="bgf-r" d="M-20 520C140 380 220 560 360 430S560 120 700 260 900 330 1030 120" fill="none" stroke="#2a8fd8" stroke-opacity=".28" stroke-width="2" stroke-dasharray="3 12" stroke-linecap="round" vector-effect="non-scaling-stroke"/>${reduce?'':'<circle r="5" fill="#fff" stroke="#2a8fd8" stroke-width="2" vector-effect="non-scaling-stroke"><animateMotion dur="26s" repeatCount="indefinite"><mpath href="#bgf-r"/></animateMotion></circle>'}</svg>`
    +pins.map(([x,y,s,c,d,t])=>`<span class="bgf-pin" style="--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s;--t:${t}s">${PIN(c)}<i></i></span>`).join('')
    +bubbles.map(([x,y,s,t,d,dx])=>`<span class="bgf-bubble" style="--x:${x}%;--s:${s}px;--t:${t}s;--d:${d}s;--dx:${dx}px"></span>`).join('')
    +stars.map(([x,y,s,d,t])=>`<span class="bgf-star" style="--x:${x}%;--y:${y}%;--s:${s}px;--d:${d}s;--t:${t}s"></span>`).join('');
  document.body.prepend(box);
}
