// 顶栏飘带：上沿是一条从左上缓缓落到右下的曲线，曲线以下整片填色，
// 左边最厚、向右渐薄，到右下角收成一条线；曲线上的波纹缓缓向右流动。
const NS='http://www.w3.org/2000/svg',W=1600,H=94;
// 上沿关键点 [横向比例, 纵向比例]，取自手绘草图
const KEY=[[0,.22],[.11,.2],[.23,.32],[.32,.45],[.415,.56],[.51,.6],[.67,.63],[.76,.62],[.84,.7],[.92,.84],[1,.98]];
const TAN=KEY.map((p,i)=>{const a=KEY[Math.max(0,i-1)],b=KEY[Math.min(KEY.length-1,i+1)];return (b[1]-a[1])/(b[0]-a[0]);});
function profile(u){
  let i=0;while(i<KEY.length-2&&u>KEY[i+1][0])i++;
  const [x0,y0]=KEY[i],[x1,y1]=KEY[i+1],d=x1-x0,t=Math.min(1,Math.max(0,(u-x0)/d)),t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*y0+(t3-2*t2+t)*d*TAN[i]+(-2*t3+3*t2)*y1+(t3-t2)*d*TAN[i+1];
}
// 三层由后到前：浅蓝（最高）、亮蓝、深蓝（最低），越往右越贴近底边
const LAYERS=[
  {id:'a',color:'#6fb7ec',a0:.42,a1:.12,off:-.1,amp:2.6,speed:.06,phase:0},
  {id:'b',color:'#2a8fd8',a0:.36,a1:.1,off:0,amp:2.2,speed:.05,phase:1.6},
  {id:'c',color:'#0056a6',a0:.26,a1:.06,off:.1,amp:1.8,speed:.04,phase:3.2}
];
function outline(c,t){
  const n=140,pts=[];
  for(let i=0;i<=n;i++){
    const u=i/n;
    let y=H*(profile(u)+c.off*(1-u))+c.amp*Math.sin(6.2832*(u*1.5-t*c.speed)+c.phase)*(1-.6*u);
    pts.push([u*W,Math.min(H,Math.max(0,y))]);
  }
  const f=p=>p[0].toFixed(1)+' '+p[1].toFixed(1),edge='M'+pts.map(f).join('L');
  return {fill:edge+`L${W} ${H}L0 ${H}Z`,edge};
}
export function initRibbon(host){
  if(!host||host.querySelector('.hdr-ribbon'))return;
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','hdr-ribbon');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('preserveAspectRatio','none');
  svg.innerHTML='<defs>'+LAYERS.map(c=>`<linearGradient id="rb-${c.id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.color}" stop-opacity="${c.a0}"/><stop offset="1" stop-color="${c.color}" stop-opacity="${c.a1}"/></linearGradient>`).join('')+'</defs>'
    +LAYERS.map(c=>`<path data-s="${c.id}" fill="url(#rb-${c.id})"/>`).join('')
    +'<path data-edge="1" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.2" vector-effect="non-scaling-stroke"/>';
  host.prepend(svg);
  const paths=Object.fromEntries(LAYERS.map(c=>[c.id,svg.querySelector(`[data-s="${c.id}"]`)])),edge=svg.querySelector('[data-edge]');
  const draw=t=>{LAYERS.forEach(c=>{const o=outline(c,t);paths[c.id].setAttribute('d',o.fill);if(c.id==='b')edge.setAttribute('d',o.edge);});};
  draw(0);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let raf=0,last=0;
  const frame=ts=>{if(ts-last>33){last=ts;draw(ts/1000);}raf=requestAnimationFrame(frame);};
  const run=()=>{cancelAnimationFrame(raf);if(!document.hidden)raf=requestAnimationFrame(frame);};
  document.addEventListener('visibilitychange',run);run();
}
