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

  const btn=document.getElementById("writeBtn"), sheet=document.getElementById("sheet");
  function toggle(force){const open=force!==undefined?force:sheet.hidden;sheet.hidden=!open;btn.setAttribute("aria-expanded",open)}
  btn.addEventListener("click",()=>toggle());
  sheet.addEventListener("click",e=>{if(e.target.closest("a")) toggle(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape") toggle(false)});
  document.querySelectorAll(".js-write").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();toggle(true)}));
})();

/* ===== Фон первого экрана, пока нет фото станка (img/hero.jpg) =====
   Рисуется один раз: синяя сталь и тёплые блики стружки не в фокусе. */
(function(){
  try{
    const W=1600,H=1200,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
    let g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#3B87B5");g.addColorStop(.3,"#1C597E");g.addColorStop(.65,"#123A52");g.addColorStop(1,"#08110E");
    x.fillStyle=g;x.fillRect(0,0,W,H);
    // вертикальные блики полированного металла
    x.filter="blur(40px)";
    [[300,90,.32],[720,150,.42],[1180,80,.28]].forEach(([cx,w,a])=>{
      const lg=x.createLinearGradient(cx-w,0,cx+w,0);
      lg.addColorStop(0,"rgba(200,225,240,0)");lg.addColorStop(.5,`rgba(200,225,240,${a})`);lg.addColorStop(1,"rgba(200,225,240,0)");
      x.fillStyle=lg;x.fillRect(cx-w,0,w*2,H*.75);
    });
    // тёплые круги боке внизу
    const blob=(px,py,rad,col,a,blur)=>{x.filter=`blur(${blur}px)`;const rg=x.createRadialGradient(px,py,0,px,py,rad);
      rg.addColorStop(0,`rgba(${col},${a})`);rg.addColorStop(.7,`rgba(${col},${a*.6})`);rg.addColorStop(1,`rgba(${col},0)`);
      x.fillStyle=rg;x.beginPath();x.arc(px,py,rad,0,7);x.fill();};
    for(let i=0;i<34;i++){blob(r()*W,H*r()*.35,14+r()*50,r()<.6?"241,199,91":"255,241,194",.35+r()*.45,3+r()*8);}
    for(let i=0;i<60;i++){const py=H*(.5+r()*.5),px=r()*W,rad=10+r()*46;
      blob(px,py,rad,r()<.75?"241,199,91":"255,241,194",.18+r()*.4,2+r()*10);}
    for(let i=0;i<22;i++){blob(r()*W,H*(.15+r()*.5),16+r()*40,"156,195,220",.12+r()*.2,6+r()*10);}
    x.filter="none";
    document.getElementById("heroBg").style.setProperty("--hero-fallback",`url(${c.toDataURL("image/jpeg",.82)})`);
  }catch(e){}
})();

/* ===== Карусели: работы и отзывы ===== */
document.querySelectorAll("[data-carousel]").forEach(root=>{
  const track=root.querySelector(".track"), items=[...track.children];
  const prev=root.querySelector("[data-prev]"), next=root.querySelector("[data-next]");
  const dotsBox=root.querySelector(".dots");
  const perView=()=>{const w=items[0].getBoundingClientRect().width||1;return Math.max(1,Math.round(track.clientWidth/w))};
  const step=()=>items.length>1?items[1].offsetLeft-items[0].offsetLeft:track.clientWidth;
  let dots=[];
  function buildDots(){
    const pages=Math.max(1,items.length-perView()+1);
    if(dots.length===pages) return;
    dotsBox.innerHTML="";
    dots=[...Array(pages)].map((_,i)=>{const d=document.createElement("button");d.type="button";d.className="dot";d.setAttribute("aria-label","Слайд "+(i+1));
      d.addEventListener("click",()=>track.scrollTo({left:i*step(),behavior:"smooth"}));dotsBox.appendChild(d);return d});
    dotsBox.hidden=pages<2;
  }
  function update(){
    buildDots();
    const i=Math.round(track.scrollLeft/step());
    dots.forEach((d,k)=>d.setAttribute("aria-current",k===Math.min(i,dots.length-1)));
    prev.disabled=track.scrollLeft<4;
    next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-4;
  }
  prev.addEventListener("click",()=>track.scrollBy({left:-step(),behavior:"smooth"}));
  next.addEventListener("click",()=>track.scrollBy({left:step(),behavior:"smooth"}));
  track.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();next.click()}if(e.key==="ArrowLeft"){e.preventDefault();prev.click()}});
  let t;track.addEventListener("scroll",()=>{cancelAnimationFrame(t);t=requestAnimationFrame(update)},{passive:true});
  addEventListener("resize",update);
  update();
});
