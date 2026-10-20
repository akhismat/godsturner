/* ===== Контакты: заполнить, когда мастер пришлёт ===== */
const CONTACTS = {
  phone: "",      // например "+79140000000"
  phoneText: "",  // например "+7 914 000-00-00"
  telegram: "",   // username без @
  max: "",        // ссылка на профиль в MAX
  route: ""       // ссылка «Построить маршрут» на точку гаража
};
(function(){
  const set=(sel,href)=>{ if(!href) return; document.querySelectorAll(sel).forEach(a=>a.href=href); };
  set(".js-call", CONTACTS.phone && "tel:"+CONTACTS.phone);
  set(".js-tg", CONTACTS.telegram && "https://t.me/"+CONTACTS.telegram);
  set(".js-max", CONTACTS.max);
  set(".js-route", CONTACTS.route);
  if(CONTACTS.phoneText) document.querySelectorAll(".js-phone-text").forEach(e=>e.textContent=CONTACTS.phoneText);
  document.querySelectorAll(".js-write").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();toggle(true)}));

  const btn=document.getElementById("writeBtn"), sheet=document.getElementById("sheet");
  function toggle(force){const open=force!==undefined?force:sheet.hidden;sheet.hidden=!open;btn.setAttribute("aria-expanded",open)}
  btn.addEventListener("click",()=>toggle());
  sheet.addEventListener("click",e=>{if(e.target.closest("a")) toggle(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape") toggle(false)});
})();

/* ===== Искры на первом экране ===== */
(function(){
  const c=document.getElementById("sparks"); if(!c||!c.getContext) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const x=c.getContext("2d"); let w,h,dpr,ps=[],run=true;
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);w=c.offsetWidth;h=c.offsetHeight;c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
  size(); addEventListener("resize",size);
  function spawn(){
    const ox=w*0.92, oy=h*0.88;
    const a=Math.PI*(1.05+Math.random()*0.5), v=2+Math.random()*5;
    ps.push({x:ox,y:oy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0,m:40+Math.random()*50});
  }
  function tick(){
    if(!run) return;
    for(let i=0;i<3;i++) spawn();
    x.clearRect(0,0,w,h);
    x.globalCompositeOperation="lighter";
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i]; p.l++; p.vy+=0.09; p.vx*=0.995;
      const px=p.x,py=p.y; p.x+=p.vx; p.y+=p.vy;
      const t=1-p.l/p.m;
      if(t<=0||p.y>h+10){ps.splice(i,1);continue}
      x.strokeStyle=`rgba(${222},${170+Math.round(60*t)},${110*t},${t*0.85})`;
      x.lineWidth=1.2; x.beginPath(); x.moveTo(px-p.vx*1.5,py-p.vy*1.5); x.lineTo(p.x,p.y); x.stroke();
    }
    requestAnimationFrame(tick);
  }
  new IntersectionObserver(es=>{run=es[0].isIntersecting; if(run) requestAnimationFrame(tick)}).observe(c);
})();
