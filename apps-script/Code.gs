/*  SRU Rooms Digital Twin — Backend (Google Apps Script Web App)
    منصة التوأم الرقمي للقاعات — الخادم
    Version: 1.0
    Backend  : Google Sheet (tabs: Rooms, AccessLog)
    Security : Google sign-in restricted to @sr.edu.sa (verified server-side)
    Photos   : uploaded to a Drive folder, URL stored in the Rooms sheet
    Deploy   : Deploy > New deployment > Web app
               Execute as: Me   |   Who has access: Anyone
*/

// ===== CONFIG =================================================
var ALLOWED_DOMAIN = 'sr.edu.sa';                 // only this e-mail domain may sign in
var SHEET_ID       = '';                          // paste the Google Sheet ID (leave '' to use the bound sheet)
var PHOTO_FOLDER_ID= '';                          // paste a Drive folder ID for room photos (optional)
var GOOGLE_CLIENT_ID = '';                        // same OAuth Web client ID used by the front-end
var ADMIN_EMAILS   = ['m.elmahdy@sr.edu.sa'];     // who may add / edit rooms
// ==============================================================

var ROOM_COLS = ['RoomID','RoomName','Category','SourceType','Gender','Building',
                 'Capacity','Status','Devices','Specs','PhotoURLs','Notes','UpdatedBy','UpdatedAt'];
var LOG_COLS  = ['Email','Date','Time','Action','Platform'];
var PLATFORM  = 'Rooms Digital Twin';

function ss_(){ return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }

function sheet_(name, cols){
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if(!sh){ sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); }
  return sh;
}

// ---- entry points -------------------------------------------
function doGet(e){
  var action = (e && e.parameter && e.parameter.action) || 'list';
  try {
    if(action === 'list')   return json_({ ok:true, rooms: listRooms_() });
    if(action === 'ping')   return json_({ ok:true, version:'1.0' });
    return json_({ ok:false, error:'unknown action' });
  } catch(err){ return json_({ ok:false, error:String(err) }); }
}

function doPost(e){
  var body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch(_){}
  var action = body.action || '';
  try {
    // every call must carry a valid Google credential for an @sr.edu.sa user
    var user = verify_(body.credential);
    if(!user) return json_({ ok:false, error:'unauthorized', reason:'invalid or non-@'+ALLOWED_DOMAIN+' account' });

    if(action === 'login'){
      logAccess_(user.email, 'Login');
      return json_({ ok:true, email:user.email, name:user.name||'', isAdmin: isAdmin_(user.email) });
    }
    if(action === 'list'){
      return json_({ ok:true, rooms: listRooms_(), isAdmin: isAdmin_(user.email) });
    }
    if(action === 'save'){
      if(!isAdmin_(user.email)) return json_({ ok:false, error:'forbidden' });
      var saved = saveRoom_(body.room, user.email);
      logAccess_(user.email, 'SaveRoom:'+saved.RoomID);
      return json_({ ok:true, room: saved });
    }
    if(action === 'uploadPhoto'){
      if(!isAdmin_(user.email)) return json_({ ok:false, error:'forbidden' });
      var url = uploadPhoto_(body.roomId, body.filename, body.mimeType, body.dataBase64);
      return json_({ ok:true, url: url });
    }
    return json_({ ok:false, error:'unknown action' });
  } catch(err){ return json_({ ok:false, error:String(err) }); }
}

// ---- auth ---------------------------------------------------
function verify_(credential){
  if(!credential) return null;
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(credential),
                              { muteHttpExceptions:true });
  if(res.getResponseCode() !== 200) return null;
  var p = JSON.parse(res.getContentText());
  if(GOOGLE_CLIENT_ID && p.aud !== GOOGLE_CLIENT_ID) return null;      // token must be for our app
  if(p.email_verified !== 'true' && p.email_verified !== true) return null;
  var email = (p.email||'').toLowerCase();
  var dom = (p.hd||'') || email.split('@')[1] || '';
  if(dom.toLowerCase() !== ALLOWED_DOMAIN) return null;               // domain gate
  return { email: email, name: p.name };
}

function isAdmin_(email){
  email = (email||'').toLowerCase();
  return ADMIN_EMAILS.map(function(a){return a.toLowerCase();}).indexOf(email) !== -1;
}

// ---- rooms --------------------------------------------------
function listRooms_(){
  var sh = sheet_('Rooms', ROOM_COLS);
  var values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  var head = values[0];
  var idx = {}; ROOM_COLS.forEach(function(c){ idx[c] = head.indexOf(c); });
  var out = [];
  for(var r=1;r<values.length;r++){
    var row = values[r]; if(!row[idx.RoomID]) continue;
    var o = {}; ROOM_COLS.forEach(function(c){ o[c] = idx[c]>=0 ? String(row[idx[c]]==null?'':row[idx[c]]) : ''; });
    out.push(o);
  }
  return out;
}

function saveRoom_(room, email){
  var sh = sheet_('Rooms', ROOM_COLS);
  var values = sh.getDataRange().getValues();
  var head = values[0];
  var idIdx = head.indexOf('RoomID');
  room = room || {};
  if(!room.RoomID){                                   // new room -> next R### id
    var max = 0;
    for(var r=1;r<values.length;r++){
      var m = /R(\d+)/.exec(String(values[r][idIdx]||'')); if(m) max = Math.max(max, parseInt(m[1],10));
    }
    room.RoomID = 'R' + ('000'+(max+1)).slice(-3);
  }
  room.UpdatedBy = email;
  room.UpdatedAt = nowStr_();
  var rowArr = ROOM_COLS.map(function(c){ return room[c]!=null ? room[c] : ''; });

  var found = -1;
  for(var i=1;i<values.length;i++){ if(String(values[i][idIdx]) === String(room.RoomID)){ found = i+1; break; } }
  if(found > 0) sh.getRange(found,1,1,ROOM_COLS.length).setValues([rowArr]);
  else          sh.appendRow(rowArr);
  return room;
}

// ---- photos -------------------------------------------------
function uploadPhoto_(roomId, filename, mimeType, dataBase64){
  var folder = PHOTO_FOLDER_ID ? DriveApp.getFolderById(PHOTO_FOLDER_ID) : DriveApp.getRootFolder();
  var bytes = Utilities.base64Decode(dataBase64);
  var blob  = Utilities.newBlob(bytes, mimeType || 'image/jpeg', (roomId||'room')+'_'+filename);
  var file  = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // return a direct-view URL usable in <img>
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

// ---- access log --------------------------------------------
function logAccess_(email, action){
  var sh = sheet_('AccessLog', LOG_COLS);
  var tz = Session.getScriptTimeZone() || 'Asia/Riyadh';
  var now = new Date();
  sh.appendRow([ email,
                 Utilities.formatDate(now, tz, 'yyyy-MM-dd'),
                 Utilities.formatDate(now, tz, 'HH:mm:ss'),
                 action || 'Login',
                 PLATFORM ]);
}

// ---- helpers ------------------------------------------------
function nowStr_(){
  var tz = Session.getScriptTimeZone() || 'Asia/Riyadh';
  return Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
}
function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

// ---- one-time seeding --------------------------------------
// Paste the rooms-seed.json array into SEED below, then run seedRooms() once.
function seedRooms(){
  var SEED = [];                                   // <-- paste array from data/rooms-seed.json
  if(!SEED.length){ throw new Error('Paste rooms-seed.json into SEED first.'); }
  var sh = sheet_('Rooms', ROOM_COLS);
  if(sh.getLastRow() > 1) sh.getRange(2,1,sh.getLastRow()-1,ROOM_COLS.length).clearContent();
  var rows = SEED.map(function(o){ return ROOM_COLS.map(function(c){ return o[c]!=null?o[c]:''; }); });
  if(rows.length) sh.getRange(2,1,rows.length,ROOM_COLS.length).setValues(rows);
}
