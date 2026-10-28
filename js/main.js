/* ===== Контакты: заполнить, когда мастер пришлёт ===== */
const CONTACTS = {
  phone: "+79333833033",          // для звонка
  phoneText: "+7 933 383-30-33",  // как показать
  // MAX не умеет открывать чат по номеру телефона и подставлять текст в чат конкретному человеку.
  // Поэтому кнопка копирует приветствие в буфер и открывает профиль мастера — остаётся вставить и отправить.
  // Ссылка на профиль: в MAX → Профиль → Поделиться → Скопировать ссылку (вида https://max.ru/u/...).
  max: "",
  maxText: "Здравствуйте! Я с вашего сайта, хочу обсудить заказ.",
  route: ""       // ссылка «Построить маршрут» на точку гаража
};
(function(){
  const set=(sel,href)=>{ if(!href) return; document.querySelectorAll(sel).forEach(a=>a.href=href); };
  set(".js-call", CONTACTS.phone && "tel:"+CONTACTS.phone);
  set(".js-max", CONTACTS.max);
  // кнопки MAX: скопировать приветствие и открыть профиль
  const toast=document.createElement("div");toast.className="toast";toast.setAttribute("role","status");document.body.appendChild(toast);
  let tt;const say=(msg)=>{toast.textContent=msg;toast.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove("on"),4200)};
  document.querySelectorAll(".js-max").forEach(a=>a.addEventListener("click",e=>{
    if(!CONTACTS.max){e.preventDefault();say("Ссылка на MAX скоро появится. Пока позвоните: "+(CONTACTS.phoneText||""));return;}
    try{navigator.clipboard.writeText(CONTACTS.maxText).then(()=>say("Текст скопирован. Вставьте его в чат и отправьте"),()=>{});}catch(err){}
  }));
  set(".js-route", CONTACTS.route);
  if(CONTACTS.phoneText) document.querySelectorAll(".js-phone-text").forEach(e=>e.textContent=CONTACTS.phoneText);
})();

/* ===== Фото: если файла ещё нет, вместо битой картинки — подпись с путём, куда его положить ===== */
document.querySelectorAll(".img img[data-ph]").forEach(im=>{
  const ph=()=>{const box=im.closest(".img"); if(box) box.textContent=im.dataset.ph;};
  if(im.complete && !im.naturalWidth && im.currentSrc) ph(); else im.addEventListener("error",ph,{once:true});
  // для размытого фона вокруг фото работ
  const box=im.closest(".img"); if(box) box.style.setProperty("--src",`url("${new URL(im.getAttribute("src"),document.baseURI).href}")`);
});

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
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{layoutCuts();setupBackground()});
layoutCuts();
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(layoutCuts,120)});

/* ===== Общий фон страницы =====
   Порядок: видео (video/bg.mp4), если есть и запускается без ошибок → иначе картинка (img/bg.jpg) → иначе дым по умолчанию.
   Пути считаются от index.html. Чтобы отключить видео или картинку, оставьте пустую строку. */
const BG = { video: "video/bg.mp4", image: "img/bg.jpg" };

function bgUrl(path){ return new URL(path, document.baseURI).href; }

function useVideo(el){
  return new Promise(ok=>{
    if(!BG.video || matchMedia("(prefers-reduced-motion: reduce)").matches) return ok(false);
    const v=document.createElement("video");
    v.muted=true; v.loop=true; v.playsInline=true; v.autoplay=true; v.preload="auto";
    v.setAttribute("muted",""); v.setAttribute("playsinline","");
    let done=false; const finish=r=>{ if(done) return; done=true; if(!r) v.remove(); ok(r); };
    v.addEventListener("error",()=>finish(false));
    v.addEventListener("loadeddata",()=>{
      const p=v.play();
      (p&&p.then?p:Promise.resolve()).then(()=>{ v.classList.add("on"); finish(true); }).catch(()=>finish(false));
    });
    setTimeout(()=>finish(false),8000);          // слишком долго грузится — не ждём
    v.src=bgUrl(BG.video); el.appendChild(v);
  });
}
function useImage(el){
  return new Promise(ok=>{
    if(!BG.image) return ok(false);
    const im=new Image(), url=bgUrl(BG.image);
    im.onload=()=>{ el.style.setProperty("--img",`url("${url}")`); ok(true); };
    im.onerror=()=>ok(false);
    im.src=url;
  });
}

/* Дым по умолчанию: шум с завихрениями, считается один раз в маленьком размере и растягивается на страницу */
function paintSmoke(el){
  try{
    const pw=el.clientWidth||innerWidth, ph=el.clientHeight||4000;
    const W=300,H=1200,sx=pw/W,sy=ph/H;
    const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    const img=x.createImageData(W,H),d=img.data;
    const hash=(i,j)=>{let h=i*374761393+j*668265263;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967295};
    const sm=t=>t*t*(3-2*t);
    const noise=(px,py)=>{const i=Math.floor(px),j=Math.floor(py),fx=sm(px-i),fy=sm(py-j);
      const a=hash(i,j),b=hash(i+1,j),cc=hash(i,j+1),dd=hash(i+1,j+1);
      return a+(b-a)*fx+(cc-a)*fy+(a-b-cc+dd)*fx*fy};
    const fbm=(px,py)=>{let v=0,a=.5;for(let o=0;o<5;o++){v+=a*noise(px,py);px=px*2.03+17.1;py=py*2.03+9.7;a*=.5}return v};
    const S=520;   // размер клубов в пикселях страницы
    for(let j=0;j<H;j++){
      const yPage=j*sy, top=Math.max(0,1-yPage/1100);      // на первом экране дым гуще и светлее
      for(let i=0;i<W;i++){
        const px=i*sx/S, py=yPage/S;
        const qx=fbm(px,py), qy=fbm(px+5.2,py+1.3);
        const f=fbm(px+3.2*qx,py+3.2*qy);
        let s=Math.min(1,Math.max(0,(f-.38)/.42)); s=s*s*(3-2*s);
        s=.22+.78*s*(.8+.2*top);                         // дым есть по всей длине, чтобы буквы всегда читались
        const warm=Math.max(0,qx-.55)*1.4;                  // тёплый отсвет искр местами
        const k=(j*W+i)*4;
        d[k]  =8 +s*(150+warm*90);
        d[k+1]=17+s*(165+warm*40);
        d[k+2]=14+s*(175-warm*60);
        d[k+3]=255;
      }
    }
    x.putImageData(img,0,0);
    el.style.setProperty("--fb",`url(${c.toDataURL("image/jpeg",.88)})`);
  }catch(e){}
}

async function setupBackground(){
  const el=document.getElementById("pageBg"); if(!el) return;
  if(await useVideo(el)) return;
  if(await useImage(el)) return;
  paintSmoke(el);
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

/* ===== Анимация при открытии (как в примере с маникюром) =====
   Чёрные шторки над фоном первого экрана по очереди уезжают вверх,
   затем поднимаются шапка, заголовок, подпись и кнопки. */
(function(){
  var root=document.documentElement;
  if(!root.classList.contains('is-entering')) return;
  var EXPO='cubic-bezier(0.16,1,0.3,1)', QUART='cubic-bezier(0.76,0,0.24,1)';
  Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(function(r){setTimeout(r,700)})]).then(function(){
    if(!root.classList.contains('is-entering')) return;
    window.__entrance=true;
    var anims=[],q=function(sel){return document.querySelector(sel)};
    function play(el,kf,t,d,e){ if(el) anims.push(el.animate(kf,{delay:t*1000,duration:d*1000,easing:e||EXPO,fill:'both'})); }
    function rise(px){ return [{opacity:0,transform:'translateY('+px+'px)'},{opacity:1,transform:'none'}]; }
    [].forEach.call(document.querySelectorAll('.lid'),function(l,i){ play(l,[{opacity:1,transform:'scaleY(1)'},{opacity:1,transform:'scaleY(0)'}],.06+i*.05,1.0,QUART); });
    [].forEach.call(document.querySelectorAll('.hnav > *'),function(el,i){ play(el,rise(6),.50+i*.12,.6); });
    play(q('.hcopy h1'),[{opacity:1,transform:'translateY(100%)',clipPath:'inset(-100% -8px 100% -8px)'},{opacity:1,transform:'none',clipPath:'inset(-20% -8px -20% -8px)'}],.80,1.0);
    play(q('.hcopy .lead'),rise(8),1.05,.7);
    play(q('.facts'),rise(8),1.15,.7);
    play(q('.dock'),rise(16),1.30,.7);
    root.classList.remove('is-entering');
    Promise.all(anims.map(function(a){return a.finished})).then(function(){anims.forEach(function(a){a.cancel()})},function(){});
  });
})();
