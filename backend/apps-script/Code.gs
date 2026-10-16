/** Bound Google Apps Script. Run prepararPlanilha once from the editor before deployment. */
var FORUM_VERSION = 2;
var FORUM_HEADERS = ['ID','Nome','Contato','Data','Endereço','Gravidade','Latitude','Longitude','Serial','Cultura','Concentração','Unidade'];
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function failure_(code) { return json_({status:'error', error:code, apiVersion:FORUM_VERSION}); }
function fail_(code) { var e = new Error(code); e.publicCode = code; throw e; }
function properties_() { return PropertiesService.getScriptProperties(); }
function sheet_() {
  var props = properties_(), id = props.getProperty('FORUM_SPREADSHEET_ID'), tab = props.getProperty('FORUM_SHEET_ID');
  if (!id || tab === null) fail_('setup_required');
  var sheet = SpreadsheetApp.openById(id).getSheetById(Number(tab));
  if (!sheet) fail_('sheet_missing');
  return sheet;
}
function normalizedHeader_(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function verificarCabecalhos_(sheet) {
  var aliases = [['id'],['nome','nomecompleto'],['contato'],['data'],['endereco'],['gravidade','niveldegravidade'],['lat','latitude'],['lng','lon','longitude'],['serial','serialdoaparelho'],['cultura','tipodeculturaafetada']];
  var headers = sheet.getRange(1,1,1,12).getValues()[0];
  for (var i=0;i<10;i++) if (aliases[i].indexOf(normalizedHeader_(headers[i])) === -1) fail_('header_mismatch_column_' + (i+1));
  if (normalizedHeader_(headers[10]) !== 'concentracao' || normalizedHeader_(headers[11]) !== 'unidade') fail_('measurement_columns_missing');
}
/** Editor-only setup: preserves A:J and existing rows; refuses occupied K:L. */
function prepararPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Abra este projeto por Extensões > Apps Script na planilha original.');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var props = properties_();
    var stored = props.getProperty('FORUM_SHEET_ID');
    var sheet = stored === null ? ss.getSheets()[0] : ss.getSheetById(Number(stored));
    if (!sheet) throw new Error('A aba configurada não existe. Confira FORUM_SHEET_ID.');
    if (sheet.getMaxColumns() < 12) sheet.insertColumnsAfter(sheet.getMaxColumns(),12-sheet.getMaxColumns());
    if (sheet.getLastRow() === 0) sheet.getRange(1,1,1,12).setValues([FORUM_HEADERS]);
    else {
      var headers = sheet.getRange(1,1,1,12).getValues()[0];
      var ready = normalizedHeader_(headers[10]) === 'concentracao' && normalizedHeader_(headers[11]) === 'unidade';
      // Validate the ten legacy positions before touching data or labels.
      var aliases = [['id'],['nome','nomecompleto'],['contato'],['data'],['endereco'],['gravidade','niveldegravidade'],['lat','latitude'],['lng','lon','longitude'],['serial','serialdoaparelho'],['cultura','tipodeculturaafetada']];
      for (var i=0;i<10;i++) if (aliases[i].indexOf(normalizedHeader_(headers[i])) === -1) throw new Error('Cabeçalho inesperado na coluna '+(i+1)+'. Confira a ordem A:J no README antes de continuar.');
      if (!ready) {
        var occupied = sheet.getRange(1,11,Math.max(sheet.getLastRow(),1),2).getValues().some(function(row){return row.some(function(v){return v !== '';});});
        var formulas = sheet.getRange(1,11,Math.max(sheet.getLastRow(),1),2).getFormulas().some(function(row){return row.some(Boolean);});
        if (occupied || formulas) throw new Error('K:L já contêm dados. Nada foi sobrescrito.');
        sheet.getRange(1,11,1,2).setValues([['Concentração','Unidade']]);
      }
    }
    verificarCabecalhos_(sheet);
    props.setProperty('FORUM_SPREADSHEET_ID',ss.getId());
    props.setProperty('FORUM_SHEET_ID',String(sheet.getSheetId()));
    if (props.getProperty('FORUM_ACCEPT_SUBMISSIONS') === null) props.setProperty('FORUM_ACCEPT_SUBMISSIONS','true');
    SpreadsheetApp.flush();
    return 'Pronto. Mesma planilha e aba; colunas K:L disponíveis. Atualize a implantação existente.';
  } finally { lock.releaseLock(); }
}
function date_(value) {
  if (value instanceof Date) return Utilities.formatDate(value,'America/Sao_Paulo','yyyy-MM-dd');
  return String(value || '').replace(/^'/,'').slice(0,10);
}
function number_(value,min,max) {
  if (value === null || value === undefined || typeof value === 'boolean' || (typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') fail_('invalid_number');
  var n=Number(value); if (!Number.isFinite(n) || n<min || n>max) fail_('invalid_number'); return n;
}
function text_(value,max) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length>max || /[\u0000-\u001f\u007f]/.test(value)) fail_('invalid_text');
  return value.trim();
}
function validate_(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) fail_('invalid_record');
  var p={id:text_(obj.id,80),nome:text_(obj.nome,120),contato:text_(obj.contato,160),data:text_(obj.data,10),endereco:text_(obj.endereco,240),gravidade:text_(obj.gravidade,12),lat:number_(obj.lat,-90,90),lng:number_(obj.lng,-180,180),serial:text_(obj.serial,60),cultura:text_(obj.cultura,80),concentracao:number_(obj.concentracao,0,Number.MAX_VALUE),unidade:text_(obj.unidade,10)};
  if (!/^ID-[a-zA-Z0-9-]{8,72}$/.test(p.id)) fail_('invalid_id');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.data)) fail_('invalid_date');
  var d=new Date(p.data+'T00:00:00Z');
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10)!==p.data) fail_('invalid_date');
  if (['Baixa','Média','Alta','Extrema'].indexOf(p.gravidade)===-1) fail_('invalid_severity');
  if (['mg/mL','µg/L','mg/L'].indexOf(p.unidade)===-1) fail_('invalid_unit');
  return p;
}
function safeCell_(text) { return /^[\s]*[=+@\-']/.test(text) ? "'"+text : text; }
function row_(p) { return [p.id,safeCell_(p.nome),safeCell_(p.contato),p.data,safeCell_(p.endereco),p.gravidade,p.lat,p.lng,safeCell_(p.serial),safeCell_(p.cultura),p.concentracao,p.unidade]; }
function publicRecord_(row) {
  var concentration = null, unit = null;
  if (row[10] !== '' && row[10] !== null && row[10] !== undefined && Number.isFinite(Number(row[10])) && Number(row[10])>=0 && ['mg/mL','µg/L','mg/L'].indexOf(row[11])>=0) { concentration=Number(row[10]); unit=row[11]; }
  // Explicit allowlist. Never expose name, contact, address or device serial.
  return {id:String(row[0]),data:date_(row[3]),gravidade:row[5],lat:row[6],lng:row[7],cultura:row[9],concentracao:concentration,unidade:unit};
}
function doGet(e) {
  try {
    var sheet=sheet_(); verificarCabecalhos_(sheet);
    var records=sheet.getDataRange().getValues().slice(1).filter(function(row){return row[0] !== '';}).map(publicRecord_);
    // Legacy readers receive the same public allowlist. Versioned readers can verify deployment.
    return json_(e && e.parameter && e.parameter.apiVersion === '2' ? {apiVersion:2,records:records} : records);
  } catch(err) { return failure_(err.publicCode || 'server_error'); }
}
function doPost(e) {
  var lock;
  try {
    if (!e || !e.postData || typeof e.postData.contents !== 'string' || e.postData.contents.length>12000) return failure_('invalid_request');
    var payload;
    try { payload=JSON.parse(e.postData.contents); } catch(err) { return failure_('invalid_json'); }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return failure_('invalid_request');
    // No public editing/deletion; spreadsheet editors manage records using Google permissions.
    if (payload.action !== 'add') return failure_('action_not_allowed');
    if (payload.apiVersion !== 2) return failure_('upgrade_required');
    if (properties_().getProperty('FORUM_ACCEPT_SUBMISSIONS') !== 'true') return failure_('submissions_disabled');
    var p=validate_(payload.dados);
    lock=LockService.getScriptLock();
    if (!lock.tryLock(10000)) return failure_('busy');
    var sheet=sheet_(); verificarCabecalhos_(sheet);
    var rows=sheet.getDataRange().getValues();
    for(var i=1;i<rows.length;i++) if(String(rows[i][0])===p.id) {
      // Same request ID can be retried, but cannot overwrite a different payload.
      var saved=rows[i].slice(0,12), proposed=row_(p);
      saved[3]=date_(saved[3]);
      var equal=saved.every(function(v,j){ var t=proposed[j]; return String(v)===String(t) || (typeof t==='string' && t[0]==="'" && String(v)===t.slice(1)); });
      if (!equal) return failure_('id_conflict');
      return json_({status:'success',apiVersion:2,id:p.id,duplicate:true});
    }
    sheet.appendRow(row_(p)); SpreadsheetApp.flush();
    return json_({status:'success',apiVersion:2,id:p.id});
  } catch(err) { return failure_(err.publicCode || 'server_error'); }
  finally { if(lock && lock.hasLock()) lock.releaseLock(); }
}
