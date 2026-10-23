"use strict";
(() => {
  const W = 1600, H = 1600;
  const canvas = document.getElementById("world"), ctx = canvas.getContext("2d");
  const detail = document.getElementById("detail"), dctx = detail.getContext("2d");
  const status = document.getElementById("status");
  const initial = [
    {id:"cushion",name:"Đệm hiên",locked:true,x:920,y:555,w:140,bounds:{x:850,y:455,w:140,h:100}},
    {id:"viewer",name:"Hộp xem phim",file:"original-viewer-stand-clean-v15b.png",x:630,y:900,w:130},
    {id:"chair",name:"Ghế Thư viện",locked:true,x:670,y:645,w:150,bounds:{x:595,y:485,w:150,h:160}},
    {id:"board",name:"Bảng học từ",file:"apple-board-clean-v15c.png",x:1102,y:950,w:92},
    {id:"table",name:"Bàn Chơi & Ôn",locked:true,x:1105,y:1170,w:160,bounds:{x:1025,y:1040,w:160,h:130}},
    {id:"raft",name:"Bè câu",locked:true,x:945,y:1590,w:550,bounds:{x:670,y:1330,w:550,h:260}},
    {id:"may",name:"Bé Mây",file:"may-sitting-clean-v15c.png",x:830,y:945,w:160}
  ];
  const layers = initial.map(item => ({...item}));
  let selected = "may", zoom = 1, onlyBackground = false, bg = null, dragging = null, ready = false;
  const byId = id => layers.find(layer => layer.id === id);
  const buttons = document.getElementById("asset-list");
  const load = src => new Promise((resolve,reject) => {const img = new Image();img.onload = () => resolve(img);img.onerror = () => reject(new Error("Không mở được " + src));img.src = src;});
  function rect(layer) {const h = layer.w * layer.bounds.h / layer.bounds.w;return {x:layer.x-layer.w/2,y:layer.y-h,w:layer.w,h};}
  function drawLayer(context,layer,box) {const b=layer.bounds;context.drawImage(layer.image,b.x,b.y,b.w,b.h,box.x,box.y,box.w,box.h);}
  function draw() {
    ctx.clearRect(0,0,W,H);if(bg)ctx.drawImage(bg,0,0,W,H);
    if(onlyBackground)return;
    for(const layer of layers){if(!layer.image)continue;const r=rect(layer);if(!layer.locked)drawLayer(ctx,layer,r);if(layer.id===selected){ctx.save();ctx.strokeStyle="#fff9de";ctx.lineWidth=4;ctx.setLineDash([8,8]);ctx.strokeRect(r.x-8,r.y-8,r.w+16,r.h+16);ctx.restore();}}
  }
  function drawDetail() {
    const layer=byId(selected);dctx.clearRect(0,0,detail.width,detail.height);if(!layer?.image)return;
    const b=layer.bounds, scale=Math.min(500/b.w,350/b.h)*zoom;
    drawLayer(dctx,layer,{x:(640-b.w*scale)/2,y:(480-b.h*scale)/2,w:b.w*scale,h:b.h*scale});
  }
  function select(id) {
    selected=id;for(const button of buttons.children)button.setAttribute("aria-pressed",String(button.dataset.id===id));
    const layer=byId(id);document.getElementById("selected-name").textContent=layer.name;
    if(layer.image)document.getElementById("asset-facts").textContent=layer.locked?"Chi tiết giữ nguyên từ ảnh chị duyệt · chỉ xem cận nét.":`PNG ${layer.image.naturalWidth} × ${layer.image.naturalHeight} · lớp đã làm sạch nét, có thể kéo.`;
    document.querySelectorAll("[data-move]").forEach(button=>button.disabled=!!layer.locked);
    drawDetail();draw();
  }
  function move(dx,dy) {if(!ready)return;const layer=byId(selected);if(layer.locked)return;layer.x=Math.max(layer.w/2,Math.min(W-layer.w/2,layer.x+dx));layer.y=Math.max(rect(layer).h,Math.min(H,layer.y+dy));status.textContent=`Đã dịch ${layer.name.toLocaleLowerCase("vi")} · Các chi tiết gốc giữ nguyên.`;draw();}
  for(const item of layers){const button=document.createElement("button");button.type="button";button.textContent=item.name;button.dataset.id=item.id;button.setAttribute("aria-pressed",String(item.id===selected));button.addEventListener("click",()=>select(item.id));buttons.appendChild(button);}
  document.querySelectorAll("[data-zoom]").forEach(button=>button.addEventListener("click",()=>{zoom=Number(button.dataset.zoom);document.querySelectorAll("[data-zoom]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));drawDetail();}));
  document.querySelectorAll("[data-move]").forEach(button=>button.addEventListener("click",()=>move(...button.dataset.move.split(",").map(Number))));
  let detailBackground = 0;
  document.getElementById("detail-background").addEventListener("click",()=>{detailBackground=(detailBackground+1)%3;detail.parentElement.dataset.background=String(detailBackground);});
  document.getElementById("background-only").addEventListener("change",event=>{onlyBackground=event.target.checked;draw();});
  document.getElementById("reset").addEventListener("click",()=>{layers.forEach((layer,i)=>Object.assign(layer,{x:initial[i].x,y:initial[i].y,w:initial[i].w}));status.textContent="Đã đặt lại vị trí các món.";draw();});
  const point=event=>{const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)*W/r.width,y:(event.clientY-r.top)*H/r.height};};
  canvas.addEventListener("pointerdown",event=>{if(onlyBackground)return;const p=point(event);const layer=[...layers].reverse().find(item=>{if(!item.image)return false;const r=rect(item);return p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;});if(!layer)return;event.preventDefault();select(layer.id);if(layer.locked)return;dragging={id:layer.id,last:p};canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});});
  canvas.addEventListener("pointermove",event=>{if(!dragging)return;const p=point(event);move(p.x-dragging.last.x,p.y-dragging.last.y);dragging.last=p;});
  for(const name of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(name,()=>{dragging=null;});
  canvas.addEventListener("keydown",event=>{const delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[event.key];if(delta&&!onlyBackground){event.preventDefault();move(...delta);}});
  Promise.all([fetch("assets/preview-manifest.json").then(response=>{if(!response.ok)throw new Error("Bản sửa chưa sẵn sàng.");return response.json();}),load("assets/May_home_background_clean_may_board_v15c.png")]).then(async([manifest,background])=>{
    bg=background;await Promise.all(layers.map(async layer=>{if(layer.locked){layer.image=bg;return;}const data=manifest.layers[layer.id];layer.image=await load("assets/"+layer.file);layer.bounds=data.bounds;Object.assign(layer,data.placement);Object.assign(initial.find(item=>item.id===layer.id),data.placement);}));
    ready=true;document.getElementById("loading").hidden=true;select(selected);
  }).catch(error=>{document.getElementById("loading").textContent=error.message;});
})();
