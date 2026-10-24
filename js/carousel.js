// 现场照片轮播：居中展示、固定画框、自动循环，悬停/聚焦/大图打开时暂停
export function initCarousel(root){
  if(!root)return;
  const slides=[...root.querySelectorAll('.slide')],n=slides.length;
  if(!n)return;
  const thumbs=[...root.querySelectorAll(".car-thumb")];
  const dots=[...root.querySelectorAll('.car-dot')],info=root.querySelector('.car-info'),count=root.querySelector('.car-count'),stage=root.querySelector('.car-stage');
  const viewer=document.getElementById('photo-viewer');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,INTERVAL=2000;
  let i=0,timer=0,hover=false,focus=false,touch=false,visible=true,swiped=false;
  root.style.setProperty('--interval',INTERVAL+'ms');
  function show(k){
    i=(k+n)%n;
    slides.forEach((s,j)=>{const on=j===i;s.classList.toggle('is-active',on);s.setAttribute('aria-hidden',String(!on));s.tabIndex=on?0:-1;});
    dots.forEach((d,j)=>{d.classList.remove('run');d.setAttribute('aria-selected',String(j===i));});
    thumbs.forEach((t,j)=>{t.classList.toggle("is-active",j===i);t.setAttribute("aria-current",String(j===i));});
    if(info)info.textContent=slides[i].dataset.info||'';
    if(count)count.textContent=`${i+1} / ${n}`;
    schedule();
  }
  function schedule(){
    clearTimeout(timer);
    if(n<2||reduce||hover||focus||touch||!visible||document.hidden||(viewer&&viewer.open))return;
    const d=dots[i];if(d){void d.offsetWidth;d.classList.add('run');}
    timer=setTimeout(()=>show(i+1),INTERVAL);
  }
  const pause=()=>{clearTimeout(timer);dots.forEach(d=>d.classList.remove('run'));};
  root.querySelector('.car-prev')?.addEventListener('click',()=>show(i-1));
  root.querySelector('.car-next')?.addEventListener('click',()=>show(i+1));
  dots.forEach((d,j)=>d.addEventListener('click',()=>show(j)));
  thumbs.forEach((t,j)=>t.addEventListener("click",()=>show(j)));
  root.addEventListener('mouseenter',()=>{hover=true;pause();});
  root.addEventListener('mouseleave',()=>{hover=false;schedule();});
  root.addEventListener('focusin',()=>{focus=true;pause();});
  root.addEventListener('focusout',()=>{focus=false;schedule();});
  root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){show(i-1);e.preventDefault();}if(e.key==='ArrowRight'){show(i+1);e.preventDefault();}});
  let x0=0;
  stage.addEventListener('pointerdown',e=>{x0=e.clientX;swiped=false;if(e.pointerType==='touch'){touch=true;pause();}});
  stage.addEventListener('pointerup',e=>{const dx=e.clientX-x0;if(Math.abs(dx)>45){swiped=true;show(dx<0?i+1:i-1);}touch=false;schedule();});
  stage.addEventListener('pointercancel',()=>{touch=false;schedule();});
  stage.addEventListener('click',e=>{if(swiped){e.stopPropagation();e.preventDefault();swiped=false;}},true);
  document.addEventListener('visibilitychange',schedule);
  if(viewer)viewer.addEventListener('close',schedule);
  if(viewer)new MutationObserver(schedule).observe(viewer,{attributes:true,attributeFilter:['open']});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;schedule();},{threshold:.3}).observe(root);
  show(0);
}
