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
