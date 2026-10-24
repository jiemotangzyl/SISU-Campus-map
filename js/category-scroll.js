// 分类胶囊横向滑动：鼠标拖拽、滚轮横移、左右箭头提示、两端渐隐、选中项自动居中
const box=document.getElementById('categories');
if(box){
  const wrap=box.parentElement,prev=wrap.querySelector('.cat-prev'),next=wrap.querySelector('.cat-next');
  let saved=0,startX=0,startLeft=0,down=false,moved=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const edges=()=>{
    const left=box.scrollLeft>4,right=box.scrollLeft+box.clientWidth<box.scrollWidth-4;
    box.classList.toggle('can-left',left);box.classList.toggle('can-right',right);
    prev&&prev.classList.toggle('show',left);next&&next.classList.toggle('show',right);
  };
  const page=dir=>box.scrollBy({left:dir*Math.max(120,box.clientWidth*.6),behavior:reduce?'auto':'smooth'});
  prev&&prev.addEventListener('click',()=>page(-1));
  next&&next.addEventListener('click',()=>page(1));
  box.addEventListener('scroll',()=>{saved=box.scrollLeft;edges();wrap.classList.add('used');},{passive:true});
  box.addEventListener('wheel',e=>{if(box.scrollWidth<=box.clientWidth||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();box.scrollLeft+=e.deltaY;},{passive:false});
  box.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;startX=e.clientX;startLeft=box.scrollLeft;});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(!moved&&Math.abs(dx)>5){moved=true;box.classList.add('dragging');}if(moved)box.scrollLeft=startLeft-dx;});
  window.addEventListener('pointerup',()=>{if(!down)return;down=false;box.classList.remove('dragging');});
  box.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false;}},true);
  new MutationObserver(()=>{
    box.scrollLeft=saved;
    const on=box.querySelector('[aria-pressed=true]');
    if(on){const target=on.offsetLeft-(box.clientWidth-on.offsetWidth)/2;box.scrollTo({left:Math.max(0,target),behavior:reduce?'auto':'smooth'});}
    edges();
  }).observe(box,{childList:true});
  addEventListener('resize',edges);
  edges();
}
