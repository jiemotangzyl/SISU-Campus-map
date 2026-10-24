// 地图图钉与图例共用的类别配色：差异明显，便于一眼分辨
export const CATS=[
  {key:'teach',name:'教学学习',color:'#1f6fd1'},
  {key:'food',name:'餐饮',color:'#f28c28'},
  {key:'sport',name:'体育运动',color:'#1fa971'},
  {key:'life',name:'生活服务',color:'#8e5bd6'},
  {key:'admin',name:'行政办事',color:'#e5484d'},
  {key:'culture',name:'文化场馆',color:'#0fb5c4'},
  {key:'gate',name:'校门道路',color:'#5b6b7c'}
];
export const pinKey=c=>(CATS.find(x=>x.name===c)||CATS[CATS.length-1]).key;
export function pinStyles(TMap){
  const s={};
  for(const c of CATS){
    const src=`assets/brand/pin-${c.key}.svg`;
    s[c.key]=new TMap.MarkerStyle({width:28,height:38,anchor:{x:14,y:38},src});
    s[c.key+'H']=new TMap.MarkerStyle({width:34,height:44,anchor:{x:17,y:44},src});
  }
  return s;
}
export function fillLegend(){
  const box=document.querySelector('.map-frame .legend');if(!box)return;
  box.innerHTML='<b>图例</b>'+CATS.map(c=>`<span data-cat="${c.name}" role="button" tabindex="0" title="点击只看这一类"><i style="background:${c.color}"></i>${c.name}</span>`).join('');
  const pick=name=>{const active=document.querySelector('.categories [aria-pressed=true]')?.dataset.category;document.querySelector(`.categories [data-category="${active===name?'全部':name}"]`)?.click();};
  box.addEventListener('click',e=>{const s=e.target.closest('[data-cat]');if(s)pick(s.dataset.cat);});
  box.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const s=e.target.closest('[data-cat]');if(s){e.preventDefault();pick(s.dataset.cat);}});
  document.getElementById('map-filter-clear')?.addEventListener('click',()=>document.getElementById('clear')?.click());
}
fillLegend();
