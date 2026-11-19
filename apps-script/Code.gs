/*  SRU Rooms Digital Twin — Apps Script (same-origin HtmlService app)
    منصة التوأم الرقمي للقاعات — خادم وواجهة بنفس الأصل
    Version: 2.1
    Hosting : the app is SERVED by this Apps Script (doGet -> HtmlService),
              so the browser <-> server calls use google.script.run (NO CORS,
              NO anonymous access needed).
    Security: deploy with  Execute as: Me  |  Who has access: Anyone within <domain>
              => only @sr.edu.sa users reach the app; identity read server-side.
    Backend : Google Sheet (tabs: Rooms, AccessLog) + Drive folder for photos.
*/

// ===== CONFIG =================================================
var ALLOWED_DOMAIN  = 'sr.edu.sa';
var SHEET_ID        = '1wxe--_wSBtwwZsjUMYLNqAs0JhqUJIgzgNdpRMSZKbs';
var PHOTO_FOLDER_ID = '17_syqcbSD47oQYiluI5sUUT4wiCRQD9q';
var ADMIN_EMAILS    = ['m.elmahdy@sr.edu.sa'];
var APP_VERSION     = '2.1';
// Logos are loaded from GitHub (image loads are not CORS-restricted):
var LOGO_BASE       = 'https://ictsru.github.io/RDT/assets/logos/';
// ==============================================================

var ROOM_COLS = ['RoomID','RoomName','Category','SourceType','Gender','Building','Floor',
                 'Capacity','Status','Devices','Specs','PhotoURLs','Notes','UpdatedBy','UpdatedAt'];
var LOG_COLS  = ['Email','Date','Time','Action','Platform'];
var PLATFORM  = 'Rooms Digital Twin';

// ---- web entry: serve the app ------------------------------
function doGet(){
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('التوأم الرقمي للقاعات الدراسية')
    .addMetaTag('viewport','width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
function include(name){ return HtmlService.createHtmlOutputFromFile(name).getContent(); }
function cfgForClient(){ return { LOGO_BASE: LOGO_BASE, VERSION: APP_VERSION, DOMAIN: ALLOWED_DOMAIN }; }

// ---- identity (server-side, no tokens needed) --------------
function currentUser_(){
  var email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if(!email || email.split('@')[1] !== ALLOWED_DOMAIN) return null;
  return email;
}
function isAdmin_(email){
  email = (email||'').toLowerCase();
  return ADMIN_EMAILS.map(function(a){return a.toLowerCase();}).indexOf(email) !== -1;
}

// ---- client-callable API (google.script.run) ---------------
function getBootstrap(){
  var email = currentUser_();
  if(!email) return { ok:false, error:'unauthorized' };
  logAccess_(email, 'Login');
  return { ok:true, email:email, isAdmin:isAdmin_(email), version:APP_VERSION, rooms:listRooms_() };
}
function saveRoomSvc(room){
  var email = currentUser_();
  if(!email) return { ok:false, error:'unauthorized' };
  if(!isAdmin_(email)) return { ok:false, error:'forbidden' };
  var saved = saveRoom_(room, email);
  logAccess_(email, 'SaveRoom:'+saved.RoomID);
  return { ok:true, room:saved };
}
function uploadPhotoSvc(roomId, filename, mimeType, dataBase64){
  var email = currentUser_();
  if(!email) return { ok:false, error:'unauthorized' };
  if(!isAdmin_(email)) return { ok:false, error:'forbidden' };
  return { ok:true, url: uploadPhoto_(roomId, filename, mimeType, dataBase64) };
}

// ---- sheet helpers -----------------------------------------
function ss_(){ return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, cols){
  var ss = ss_(); var sh = ss.getSheetByName(name);
  if(!sh){ sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); }
  return sh;
}
function ensureCols_(sh){
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var header = sh.getRange(1,1,1,lastCol).getValues()[0];
  var missing = ROOM_COLS.filter(function(c){ return header.indexOf(c) < 0; });
  if(missing.length){ sh.getRange(1, lastCol+1, 1, missing.length).setValues([missing]); }
}

function listRooms_(){
  var sh = sheet_('Rooms', ROOM_COLS); ensureCols_(sh);
  var values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  var head = values[0]; var idx = {}; ROOM_COLS.forEach(function(c){ idx[c] = head.indexOf(c); });
  var out = [];
  for(var r=1;r<values.length;r++){
    var row = values[r]; if(!row[idx.RoomID]) continue;
    var o = {}; ROOM_COLS.forEach(function(c){ o[c] = idx[c]>=0 ? String(row[idx[c]]==null?'':row[idx[c]]) : ''; });
    out.push(o);
  }
  return out;
}

function saveRoom_(room, email){
  var sh = sheet_('Rooms', ROOM_COLS); ensureCols_(sh);
  var values = sh.getDataRange().getValues();
  var head = values[0]; var idIdx = head.indexOf('RoomID');
  room = room || {};
  if(!room.RoomID){
    var max = 0;
    for(var r=1;r<values.length;r++){ var m = /R(\d+)/.exec(String(values[r][idIdx]||'')); if(m) max = Math.max(max, parseInt(m[1],10)); }
    room.RoomID = 'R' + ('000'+(max+1)).slice(-3);
  }
  room.UpdatedBy = email; room.UpdatedAt = nowStr_();
  var found = -1;
  for(var i=1;i<values.length;i++){ if(String(values[i][idIdx]) === String(room.RoomID)){ found = i+1; break; } }
  var base = found > 0 ? values[found-1].slice() : head.map(function(){ return ''; });
  head.forEach(function(colName, idx){ if(room[colName] !== undefined) base[idx] = room[colName]; });
  if(found > 0) sh.getRange(found,1,1,head.length).setValues([base]);
  else          sh.appendRow(base);
  return room;
}

function uploadPhoto_(roomId, filename, mimeType, dataBase64){
  var folder = PHOTO_FOLDER_ID ? DriveApp.getFolderById(PHOTO_FOLDER_ID) : DriveApp.getRootFolder();
  var bytes = Utilities.base64Decode(dataBase64);
  var blob  = Utilities.newBlob(bytes, mimeType || 'image/jpeg', (roomId||'room')+'_'+filename);
  var file  = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function logAccess_(email, action){
  var sh = sheet_('AccessLog', LOG_COLS);
  var tz = Session.getScriptTimeZone() || 'Asia/Riyadh'; var now = new Date();
  sh.appendRow([ email,
                 Utilities.formatDate(now, tz, 'yyyy-MM-dd'),
                 Utilities.formatDate(now, tz, 'HH:mm:ss'),
                 action || 'Login', PLATFORM ]);
}
function nowStr_(){
  var tz = Session.getScriptTimeZone() || 'Asia/Riyadh';
  return Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
}

// ---- one-time seeding (paste rooms-seed.json into SEED) -----
function seedRooms(){
  var SEED = [];
  if(!SEED.length){ throw new Error('Paste rooms-seed.json into SEED first.'); }
  var sh = sheet_('Rooms', ROOM_COLS);
  if(sh.getLastRow() > 1) sh.getRange(2,1,sh.getLastRow()-1,ROOM_COLS.length).clearContent();
  var rows = SEED.map(function(o){ return ROOM_COLS.map(function(c){ return o[c]!=null?o[c]:''; }); });
  if(rows.length) sh.getRange(2,1,rows.length,ROOM_COLS.length).setValues(rows);
}
