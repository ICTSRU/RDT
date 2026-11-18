/* SRU Rooms Digital Twin — app logic (v1.0) */
(function(){
"use strict";
var CFG = window.RDT_CONFIG || {};
var CATEGORIES = ["قاعات المحاضرات","قاعات الاختبار","القاعات الدراسية","الفصول الدراسية","أخرى"];
var state = { rooms:[], cat:"الكل", isAdmin:false, email:"", credential:"", photos:[], devices:[] };

var $ = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("show");
  clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("show");},2200);}
function splitList(s){return String(s||"").split(/[\n،,|]+/).map(function(x){return x.trim();}).filter(Boolean);}

// Devices are stored as a JSON array in the Devices column:
//   [{name, model, ip, specs:[[key,value],...]}]
// Legacy rooms (comma/line separated names) are read transparently.
function normDev(d){ d=d||{}; return {name:d.name||"", model:d.model||"", ip:d.ip||"",
  specs: Array.isArray(d.specs)? d.specs.filter(function(p){return p&&p.length;}) : []}; }
function parseDevices(s){
  s=String(s||"").trim(); if(!s) return [];
  if(s.charAt(0)==="["){ try{var a=JSON.parse(s); if(Array.isArray(a)) return a.map(normDev);}catch(e){} }
  return splitList(s).map(function(n){return {name:n,model:"",ip:"",specs:[]};});
}

// ---- logos with text fallback ----
function wireLogo(img,url,txt){
  if(!url){img.replaceWith(fallback(txt));return;}
  img.src=url; img.onerror=function(){img.replaceWith(fallback(txt));};
}
function fallback(txt){var s=document.createElement("span");s.className="logo-fallback";s.textContent=txt;return s;}

// ---- API ----
function api(action,payload){
  if(!CFG.API_URL){ return Promise.reject({offline:true}); }
  var body = Object.assign({action:action, credential:state.credential}, payload||{});
  return fetch(CFG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(body)}).then(function(r){return r.json();});
}

// ===== SIGN-IN GATE (ITOC) ==========================================
function initGate(){
  $("#gate-domain").textContent = "@"+(CFG.ALLOWED_DOMAIN||"sr.edu.sa");
  if(!CFG.GOOGLE_CLIENT_ID || !window.google){
    // offline / demo mode: allow entering without Google (read-only seed)
    $("#gate-err").textContent = CFG.GOOGLE_CLIENT_ID ? "تعذّر تحميل خدمة تسجيل الدخول من Google." :
      "وضع العرض: لم يُضبط معرّف Google بعد — سيتم عرض البيانات التجريبية فقط.";
    var b=document.createElement("button");b.className="btn btn-primary";b.textContent="دخول وضع العرض";
    b.onclick=function(){ enterApp("demo@"+(CFG.ALLOWED_DOMAIN||"sr.edu.sa"),false,true); };
    $("#gate-btn").appendChild(b);
    return;
  }
  google.accounts.id.initialize({
    client_id: CFG.GOOGLE_CLIENT_ID,
    hd: CFG.ALLOWED_DOMAIN,                 // hint: restrict to the institution domain
    callback: onCredential
  });
  google.accounts.id.renderButton($("#gate-btn"),
    {theme:"filled_blue",size:"large",shape:"pill",text:"signin_with",locale:"ar",width:260});
}

function onCredential(resp){
  var token = resp.credential;
  var claims = parseJwt(token);
  var email = (claims.email||"").toLowerCase();
  var dom = (claims.hd||email.split("@")[1]||"").toLowerCase();
  if(dom !== (CFG.ALLOWED_DOMAIN||"sr.edu.sa")){
    $("#gate-err").textContent = "يُسمح بالدخول فقط بحساب الجامعة @"+(CFG.ALLOWED_DOMAIN)+" — الحساب: "+esc(email);
    return;
  }
  state.credential = token;
  $("#gate-err").textContent = "جارٍ التحقق…";
  // server-side verify + log the sign-in, then load
  api("login").then(function(res){
    if(!res || !res.ok){ $("#gate-err").textContent = "تعذّر التحقق من الحساب على الخادم."; return; }
    enterApp(res.email||email, !!res.isAdmin, false);
  }).catch(function(e){
    if(e && e.offline){ enterApp(email, false, true); }  // no API set yet
    else $("#gate-err").textContent = "تعذّر الاتصال بالخادم.";
  });
}

function parseJwt(t){ try{return JSON.parse(decodeURIComponent(escape(atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")))));}catch(e){return {};} }

function enterApp(email,isAdmin,offline){
  state.email=email; state.isAdmin=isAdmin;
  $("#gate").classList.add("hidden");
  $("#who-email").textContent = email;
  $("#addRoomBtn").classList.toggle("hidden", !isAdmin);
  if(offline) toast("وضع العرض: بيانات تجريبية (للقراءة فقط)");
  loadRooms(offline);
}

// ===== DATA =========================================================
function loadRooms(offline){
  var done=function(rooms){ state.rooms=rooms||[]; renderTabs(); render(); };
  if(offline || !CFG.API_URL){
    fetch("data/rooms-seed.json").then(function(r){return r.json();}).then(done)
      .catch(function(){ done([]); });
    return;
  }
  api("list").then(function(res){
    if(res && res.ok){ state.isAdmin = !!res.isAdmin; $("#addRoomBtn").classList.toggle("hidden",!state.isAdmin); done(res.rooms); }
    else { toast("تعذّر جلب القاعات — عرض البيانات التجريبية"); loadRooms(true); }
  }).catch(function(){ loadRooms(true); });
}

// ===== RENDER =======================================================
function renderTabs(){
  var counts={}; state.rooms.forEach(function(r){counts[r.Category]=(counts[r.Category]||0)+1;});
  var tabs=[{k:"الكل",n:state.rooms.length}].concat(CATEGORIES.map(function(c){return {k:c,n:counts[c]||0};}));
  $("#tabs").innerHTML = tabs.map(function(t){
    return '<button class="tab'+(state.cat===t.k?' active':'')+'" data-cat="'+esc(t.k)+'">'
      +esc(t.k)+' <span class="count">'+t.n+'</span></button>';
  }).join("");
  $$("#tabs .tab").forEach(function(b){b.onclick=function(){state.cat=b.dataset.cat;renderTabs();render();};});
}

function currentList(){
  var q=($("#q").value||"").trim().toLowerCase();
  var fb=$("#fBuilding").value, fg=$("#fGender").value, fs=$("#fStatus").value;
  return state.rooms.filter(function(r){
    if(state.cat!=="الكل" && r.Category!==state.cat) return false;
    if(fb && r.Building!==fb) return false;
    if(fg && r.Gender!==fg) return false;
    if(fs && r.Status!==fs) return false;
    if(q){ var hay=(r.RoomName+" "+r.Building+" "+r.Devices+" "+r.SourceType+" "+r.RoomID).toLowerCase();
           if(hay.indexOf(q)<0) return false; }
    return true;
  });
}

function firstPhoto(r){var p=splitList(r.PhotoURLs);return p.length?p[0]:"";}

function render(){
  // populate building filter once
  if(!$("#fBuilding").dataset.ready){
    var bs=Array.from(new Set(state.rooms.map(function(r){return r.Building;}))).filter(Boolean).sort();
    $("#fBuilding").innerHTML='<option value="">كل المباني</option>'+bs.map(function(b){return '<option>'+esc(b)+'</option>';}).join("");
    $("#fBuilding").dataset.ready="1";
  }
  var list=currentList();
  $("#count").textContent=list.length+" قاعة";
  if(!list.length){ $("#grid").innerHTML='<div class="empty">لا توجد قاعات مطابقة.</div>'; return; }
  $("#grid").innerHTML=list.map(function(r){
    var photo=firstPhoto(r), dev=parseDevices(r.Devices).length;
    var on=r.Status==="نشطة";
    return '<div class="card" data-id="'+esc(r.RoomID)+'">'
      +'<div class="thumb"'+(photo?' style="background-image:url(\''+esc(photo)+'\')"':'')+'>'
        +(photo?'':ICN.monitor)
        +'<span class="badge">'+esc(r.Category)+'</span>'
        +(dev?'<span class="tech-count">'+ICN.cpu+dev+'</span>':'')
      +'</div>'
      +'<div class="body"><p class="title">'+esc(r.RoomName)+'</p>'
      +'<div class="meta">'
        +'<span>'+ICN.pin+esc(r.Building)+'</span>'
        +'<span>'+ICN.users+esc(r.Capacity||"-")+'</span>'
        +'<span>'+esc(r.Gender)+'</span>'
        +'<span class="pill '+(on?'on':'off')+'">'+esc(r.Status)+'</span>'
      +'</div></div></div>';
  }).join("");
  $$("#grid .card").forEach(function(c){c.onclick=function(){openDetail(c.dataset.id);};});
}

// ---- room detail ----
function openDetail(id){
  var r=state.rooms.filter(function(x){return x.RoomID===id;})[0]; if(!r) return;
  var photos=splitList(r.PhotoURLs), devices=parseDevices(r.Devices);
  $("#detailHead").className="mhead sru-tech-bg";
  $("#detailTitle").textContent=r.RoomName;
  var html="";
  html+='<div class="gallery">'+(photos.length? photos.map(function(u){
      return '<img src="'+esc(u)+'" alt="" onclick="window.open(this.src)">';}).join("")
    : '<div class="ph">لا توجد صور بعد</div>')+'</div>';
  html+='<div class="detail-grid">'
    +cell("المعرّف",r.RoomID)+cell("التصنيف",r.Category)
    +cell("النوع (المصدر)",r.SourceType)+cell("المبنى",r.Building)
    +cell("السعة",r.Capacity)+cell("الفئة",r.Gender)
    +cell("الحالة",r.Status)+cell("آخر تحديث",(r.UpdatedAt||"-"))
  +'</div>';
  html+='<div class="section-title">'+ICN.cpu+'الأجهزة والتقنيات ('+devices.length+')</div>';
  if(devices.length){
    html+= devices.map(function(d){
      var rows='';
      if(d.model) rows+='<tr><td>الموديل</td><td>'+esc(d.model)+'</td></tr>';
      if(d.ip)    rows+='<tr><td>عنوان IP</td><td><span class="en">'+esc(d.ip)+'</span></td></tr>';
      (d.specs||[]).forEach(function(p){ if(p[0]||p[1]) rows+='<tr><td>'+esc(p[0])+'</td><td>'+esc(p[1])+'</td></tr>'; });
      return '<div class="dev-card"><div class="dev-head">'+ICN.cpu+'<span>'+esc(d.name||"جهاز")+'</span></div>'
        +(rows? '<table class="specs-table"><tbody>'+rows+'</tbody></table>' : '<div class="hint">لا توجد مواصفات مسجّلة.</div>')
        +'</div>';
    }).join("");
  } else { html+='<div class="hint">لم تُسجّل أجهزة لهذه القاعة بعد.</div>'; }
  if(r.Notes){ html+='<div class="section-title">'+ICN.note+'ملاحظات</div><div class="hint">'+esc(r.Notes)+'</div>'; }
  $("#detailBody").innerHTML=html;
  $("#detailEdit").classList.toggle("hidden",!state.isAdmin);
  $("#detailEdit").onclick=function(){ closeModal("detailModal"); openForm(r); };
  openModal("detailModal");
}
function cell(k,v){return '<div><div class="k">'+esc(k)+'</div><div class="v">'+esc(v||"-")+'</div></div>';}
function parseSpecs(s){ return splitList(s).map(function(line){var i=line.indexOf(":");var j=line.indexOf("=");
  var p = i>=0?i:j; return p>=0?[line.slice(0,p).trim(),line.slice(p+1).trim()]:[line,""];}); }

// ---- add / edit form ----
function openForm(r){
  r=r||{};
  state.photos = splitList(r.PhotoURLs);
  var f=$("#roomForm");
  f.RoomID.value=r.RoomID||""; f.RoomName.value=r.RoomName||"";
  f.Category.value=r.Category||CATEGORIES[0]; f.SourceType.value=r.SourceType||"";
  f.Gender.value=r.Gender||"طلاب"; f.Building.value=r.Building||"";
  f.Capacity.value=r.Capacity||""; f.Status.value=r.Status||"نشطة";
  f.Specs.value=r.Specs||""; f.Notes.value=r.Notes||"";
  state.devices = parseDevices(r.Devices);
  renderDevices();
  $("#formTitle").textContent = r.RoomID? ("تعديل: "+r.RoomName) : "إضافة قاعة جديدة";
  renderThumbs();
  openModal("formModal");
}

// ---- device editor ----
function renderDevices(){
  var host=$("#devicesEditor");
  if(!state.devices.length){ host.innerHTML='<div class="hint">لا توجد أجهزة بعد — اضغط «إضافة جهاز».</div>'; return; }
  host.innerHTML = state.devices.map(function(d,i){
    var specs=(d.specs||[]).map(function(p,j){
      return '<div class="spec-row">'
        +'<input placeholder="المواصفة (مثال: الدقة)" data-dev="'+i+'" data-spec="'+j+'" data-k="k" value="'+esc(p[0]||"")+'">'
        +'<input placeholder="القيمة (مثال: 1920×1080)" data-dev="'+i+'" data-spec="'+j+'" data-k="v" value="'+esc(p[1]||"")+'">'
        +'<button type="button" class="mini-del" data-rmspec="'+i+'_'+j+'">×</button></div>';
    }).join("");
    return '<div class="dev-edit">'
      +'<div class="dev-edit-top">'
        +'<input class="dev-name" placeholder="اسم الجهاز *" data-dev="'+i+'" data-k="name" value="'+esc(d.name)+'">'
        +'<input placeholder="الموديل" data-dev="'+i+'" data-k="model" value="'+esc(d.model)+'">'
        +'<input placeholder="عنوان IP" dir="ltr" data-dev="'+i+'" data-k="ip" value="'+esc(d.ip)+'">'
        +'<button type="button" class="dev-del" data-rmdev="'+i+'">حذف الجهاز</button>'
      +'</div>'
      +'<div class="specs-wrap">'+specs+'</div>'
      +'<button type="button" class="btn-link" data-addspec="'+i+'">＋ مواصفة أخرى</button>'
    +'</div>';
  }).join("");
  // wire inputs
  $$("#devicesEditor input").forEach(function(el){
    el.addEventListener("input",function(){
      var i=+el.dataset.dev;
      if(el.dataset.spec!=null){ var j=+el.dataset.spec, k=el.dataset.k==="k"?0:1; state.devices[i].specs[j][k]=el.value; }
      else { state.devices[i][el.dataset.k]=el.value; }
    });
  });
  $$("#devicesEditor [data-rmdev]").forEach(function(b){b.onclick=function(){state.devices.splice(+b.dataset.rmdev,1);renderDevices();};});
  $$("#devicesEditor [data-addspec]").forEach(function(b){b.onclick=function(){var i=+b.dataset.addspec;state.devices[i].specs.push(["",""]);renderDevices();};});
  $$("#devicesEditor [data-rmspec]").forEach(function(b){b.onclick=function(){var p=b.dataset.rmspec.split("_");state.devices[+p[0]].specs.splice(+p[1],1);renderDevices();};});
}
function addDevice(){ state.devices.push({name:"",model:"",ip:"",specs:[]}); renderDevices(); }
function renderThumbs(){
  $("#photoThumbs").innerHTML=state.photos.map(function(u,i){
    return '<div class="t"><img src="'+esc(u)+'"><button type="button" data-i="'+i+'">×</button></div>';}).join("");
  $$("#photoThumbs .t button").forEach(function(b){b.onclick=function(){state.photos.splice(+b.dataset.i,1);renderThumbs();};});
}

function handleUpload(input){
  var file=input.files[0]; if(!file) return;
  if(!CFG.API_URL){ toast("رفع الصور يتطلب ضبط الخادم (Apps Script)."); input.value=""; return; }
  var reader=new FileReader();
  reader.onload=function(){
    var b64=reader.result.split(",")[1];
    toast("جارٍ رفع الصورة…");
    api("uploadPhoto",{roomId:$("#roomForm").RoomID.value||"new",filename:file.name,mimeType:file.type,dataBase64:b64})
      .then(function(res){ if(res&&res.ok){state.photos.push(res.url);renderThumbs();toast("تم رفع الصورة");}
                           else toast("تعذّر رفع الصورة"); })
      .catch(function(){ toast("تعذّر رفع الصورة"); });
    input.value="";
  };
  reader.readAsDataURL(file);
}

function saveRoom(e){
  e.preventDefault();
  var f=$("#roomForm");
  var devices = state.devices
    .map(function(d){ return {name:(d.name||"").trim(), model:(d.model||"").trim(), ip:(d.ip||"").trim(),
        specs:(d.specs||[]).map(function(p){return [(p[0]||"").trim(),(p[1]||"").trim()];}).filter(function(p){return p[0]||p[1];})}; })
    .filter(function(d){ return d.name||d.model||d.ip||d.specs.length; });
  var bad=devices.filter(function(d){return !d.name;});
  if(bad.length){ toast("اسم الجهاز مطلوب لكل جهاز"); return; }
  var room={ RoomID:f.RoomID.value, RoomName:f.RoomName.value.trim(), Category:f.Category.value,
    SourceType:f.SourceType.value.trim(), Gender:f.Gender.value, Building:f.Building.value.trim(),
    Capacity:f.Capacity.value.trim(), Status:f.Status.value,
    Devices: devices.length? JSON.stringify(devices) : "",
    Specs:f.Specs.value.trim(), Notes:f.Notes.value.trim(), PhotoURLs: state.photos.join("\n") };
  if(!room.RoomName){ toast("اسم القاعة مطلوب"); return; }
  if(!CFG.API_URL){ toast("الحفظ يتطلب ضبط الخادم (Apps Script)."); return; }
  $("#saveBtn").disabled=true;
  api("save",{room:room}).then(function(res){
    $("#saveBtn").disabled=false;
    if(res&&res.ok){
      var i=-1; state.rooms.forEach(function(x,k){if(x.RoomID===res.room.RoomID)i=k;});
      if(i>=0) state.rooms[i]=res.room; else state.rooms.push(res.room);
      closeModal("formModal"); renderTabs(); render(); toast("تم الحفظ ✓");
    } else toast(res&&res.error==="forbidden"?"ليست لديك صلاحية التعديل":"تعذّر الحفظ");
  }).catch(function(){ $("#saveBtn").disabled=false; toast("تعذّر الاتصال بالخادم"); });
}

// ---- modal helpers ----
function openModal(id){$("#"+id).classList.add("show");}
function closeModal(id){$("#"+id).classList.remove("show");}

// ---- icons (lucide-style inline svg) ----
var ICN={
  monitor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/></svg>',
  twin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M11 7h4a2 2 0 0 1 2 2v4M7 11v4a2 2 0 0 0 2 2h4"/></svg>'
};

// ===== BOOT =========================================================
function boot(){
  wireLogo($("#logo-sru"),CFG.LOGO_SRU,"جامعة سليمان الراجحي");
  wireLogo($("#logo-ictd"),CFG.LOGO_ICTD,"الإدارة التنفيذية للاتصالات وتقنية المعلومات");
  wireLogo($("#logo-itoc"),CFG.LOGO_ITOC,"ITOC");
  $("#itoc-link").href = CFG.ITOC_HUB||"#";
  if(CFG.LOGO_ITOC){ $("#gate-itoc").src=CFG.LOGO_ITOC; } else { $("#gate-itoc").style.display="none"; }
  $("#gate-itoc").onerror=function(){this.style.display="none";};
  $("#appMark").innerHTML=ICN.twin;
  // filters
  ["q","fBuilding","fGender","fStatus"].forEach(function(id){
    var el=$("#"+id); el.addEventListener(id==="q"?"input":"change",render);});
  $("#addRoomBtn").onclick=function(){openForm(null);};
  $("#addDeviceBtn").onclick=addDevice;
  $("#roomForm").addEventListener("submit",saveRoom);
  $("#photoInput").addEventListener("change",function(){handleUpload(this);});
  $("#signout").onclick=function(){ if(window.google&&google.accounts){google.accounts.id.disableAutoSelect();} location.reload(); };
  $$("[data-close]").forEach(function(b){b.onclick=function(){closeModal(b.dataset.close);};});
  $$(".modal-bg").forEach(function(m){m.onclick=function(e){if(e.target===m)m.classList.remove("show");};});
  initGate();
}
if(document.readyState!=="loading") boot(); else document.addEventListener("DOMContentLoaded",boot);
})();
