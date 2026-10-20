/* ===== Контакты: заполнить, когда мастер пришлёт ===== */
const CONTACTS = {
  phone: "",      // для звонка, например "+79140000000"
  phoneText: "",  // как показать, например "+7 914 000-00-00"
  max: "",        // ссылка на профиль в MAX
  route: ""       // ссылка «Построить маршрут» на точку гаража
};
(function(){
  const set=(sel,href)=>{ if(!href) return; document.querySelectorAll(sel).forEach(a=>a.href=href); };
  set(".js-call", CONTACTS.phone && "tel:"+CONTACTS.phone);
  set(".js-max", CONTACTS.max);
  set(".js-route", CONTACTS.route);
  if(CONTACTS.phoneText) document.querySelectorAll(".js-phone-text").forEach(e=>e.textContent=CONTACTS.phoneText);
})();

/* ===== Слова-вырезы: буквы во всю ширину колонки ===== */
function layoutCuts(){
  document.querySelectorAll("svg[data-cut]").forEach(svg=>{
    const W=svg.parentElement.clientWidth||innerWidth, side=Math.max(16,(W-1120)/2), target=W-2*side;
    const t=svg.querySelector("text"); t.setAttribute("font-size",100); t.setAttribute("x",side); t.setAttribute("y",100);
    svg.setAttribute("viewBox",`0 0 ${W} 200`);
    const len=t.getComputedTextLength()||1, fs=100*target/len;
    t.setAttribute("font-size",fs.toFixed(2));
    const b=t.getBBox(), pad=Math.round(Math.min(48,W*.03));
    const H=Math.ceil(b.height*0.78+pad*2);           // высота заглавных без выносных
    t.setAttribute("y",(pad+b.height*0.78).toFixed(1)); // базовая линия
    svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.style.height=H+"px";
  });
}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{layoutCuts();paintBg()});
layoutCuts();
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(layoutCuts,120)});

/* ===== Общий фон страницы. Пока нет фото (img/bg.jpg), рисуется заставка: синий металл, блики и искры по всей длине ===== */
function paintBg(){
  const el=document.getElementById("pageBg");if(!el)return;
  try{
    // небольшая картинка, растянутая на всю страницу (background-size:100% 100%);
    // круги рисуются заранее сплюснутыми, чтобы после растяжения остаться круглыми
    const pw=el.clientWidth||innerWidth, ph=el.clientHeight||4000;
    const W=600,H=2400,sx=pw/W,sy=ph/H,k=sx/sy;
    const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    let s=12345;const r=()=>(s=(s*16807)%2147483647)/2147483647;
    const SPARK=["255,246,220","255,201,74","240,138,36"];
    const g=x.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#2E77A4");for(let i=1;i<=12;i++) g.addColorStop(i/12,i%2?"#133D56":"#1C597E");
    x.fillStyle=g;x.fillRect(0,0,W,H);
    x.filter="blur(24px)";
    for(let i=0;i<26;i++){const cx=r()*W,w=20+r()*60,a=.15+r()*.3,y=r()*H;
      const lg=x.createLinearGradient(cx-w,0,cx+w,0);lg.addColorStop(0,"rgba(200,225,240,0)");lg.addColorStop(.5,`rgba(200,225,240,${a})`);lg.addColorStop(1,"rgba(200,225,240,0)");
      x.fillStyle=lg;x.fillRect(cx-w,y,w*2,(500+r()*900)/sy)}
    x.filter="none";
    const n=Math.round(ph/7);   // плотность бликов на странице
    for(let i=0;i<n;i++){
      const px=r()*W,py=r()*H,rad=(5+r()*26)/sx,a=.25+r()*.55,col=SPARK[i%3];
      x.save();x.scale(1,k);const cy=py/k;
      const rg=x.createRadialGradient(px,cy,0,px,cy,rad);
      rg.addColorStop(0,`rgba(${col},${a})`);rg.addColorStop(.55,`rgba(${col},${a*.7})`);rg.addColorStop(1,`rgba(${col},0)`);
      x.fillStyle=rg;x.beginPath();x.arc(px,cy,rad,0,7);x.fill();x.restore();
    }
    el.style.setProperty("--fb",`url(${c.toDataURL("image/jpeg",.85)})`);
  }catch(e){}
}

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
