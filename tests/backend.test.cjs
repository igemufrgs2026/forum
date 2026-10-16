const test=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs'), path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../backend/apps-script/Code.gs'),'utf8');
const HEADERS=['ID','Nome','Contato','Data','Endereço','Gravidade','Latitude','Longitude','Serial','Cultura'];
function harness(initial=[HEADERS.slice()]) {
  const rows=initial.map(r=>r.slice()), props={}; let locked=false, flushes=0;
  const sheet={
    getMaxColumns:()=>26,getLastRow:()=>rows.length,getSheetId:()=>0,
    getDataRange:()=>({getValues:()=>rows.map(r=>Array.from({length:12},(_,i)=>r[i]??''))}),
    getRange:(r,c,n,m)=>({
      getValues:()=>Array.from({length:n},(_,j)=>Array.from({length:m},(_,k)=>rows[r-1+j]?.[c-1+k]??'')),
      getFormulas:()=>Array.from({length:n},()=>Array(m).fill('')),
      setValues:(values)=>{values.forEach((row,j)=>row.forEach((v,k)=>{rows[r-1+j]??=[];rows[r-1+j][c-1+k]=v;}));}
    }),appendRow:(row)=>rows.push(row)
  };
  const ss={getSheets:()=>[sheet],getSheetById:id=>id===0?sheet:null,getId:()=> 'test-sheet'};
  const c=vm.createContext({Date, console,
    SpreadsheetApp:{getActiveSpreadsheet:()=>ss,openById:id=>{assert.equal(id,'test-sheet');return ss;},flush:()=>flushes++},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=v;}})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},
    LockService:{getScriptLock:()=>({waitLock:()=>{locked=true;},tryLock:()=>{locked=true;return true;},hasLock:()=>locked,releaseLock:()=>{locked=false;}})},
    Utilities:{formatDate:d=>d.toISOString().slice(0,10)}
  }); vm.runInContext(code,c);
  return {c,rows,props,locked:()=>locked};
}
const record=()=>({id:'ID-12345678-abcd',nome:'Pessoa fictícia',contato:'example@example.invalid',data:'2026-10-16',endereco:'Local fictício',gravidade:'Baixa',lat:-30,lng:-51,serial:'DEMO-1',cultura:'Uva',concentracao:0,unidade:'mg/mL'});
const post=(h,p=record(),extra={})=>h.c.doPost({postData:{contents:JSON.stringify({action:'add',apiVersion:2,dados:p,...extra})}});
test('migration preserves old rows, adds columns and is repeatable',()=>{
 const old=['legacy','private','private','2026-03-01','private','Baixa',0,0,'private','Uva'];
 const h=harness([HEADERS,old]); h.c.prepararPlanilha(); h.c.prepararPlanilha();
 assert.deepEqual(h.rows[1],old); assert.deepEqual(h.rows[0].slice(10),['Concentração','Unidade']); assert.equal(h.props.FORUM_SHEET_ID,'0'); assert.equal(h.locked(),false);
});
test('migration refuses unknown headers and occupied measurement columns',()=>{
 const bad=harness([['Wrong',...HEADERS.slice(1)]]); assert.throws(()=>bad.c.prepararPlanilha(),/Cabeçalho/);
 const occupied=harness([[...HEADERS,'Other','']]); assert.throws(()=>occupied.c.prepararPlanilha(),/K:L/); assert.equal(occupied.rows[0][10],'Other');
});
test('GET only exposes public fields, with null legacy measurement and valid zero',()=>{
 const h=harness([HEADERS,['legacy','SECRET','SECRET','2026-03-01','SECRET','Baixa',0,0,'SECRET','Uva']]);h.c.prepararPlanilha();post(h);
 for(const query of [{parameter:{apiVersion:'2'}},{}]) {
  const response=h.c.doGet(query), rows=Array.isArray(response)?response:response.records;
  assert.equal(JSON.stringify(rows).includes('SECRET'),false);
  assert.deepEqual(Object.keys(rows[0]).sort(),['id','data','gravidade','lat','lng','cultura','concentracao','unidade'].sort());
  assert.equal(rows[0].concentracao,null);assert.equal(rows[1].concentracao,0);
 }
});
test('add round trips measurement and retries do not duplicate',()=>{
 const h=harness();h.c.prepararPlanilha(); assert.equal(post(h).status,'success');assert.equal(post(h).duplicate,true);
 assert.equal(h.rows.length,2);assert.equal(h.rows[1][10],0);assert.equal(h.rows[1][11],'mg/mL');assert.equal(h.locked(),false);
 assert.equal(post(h,{...record(),concentracao:1}).error,'id_conflict');assert.equal(h.rows.length,2);
});
test('public delete update and unknown actions never mutate',()=>{
 const h=harness();h.c.prepararPlanilha();post(h);
 for(const action of ['delete','update','unknown',null]) assert.equal(post(h,record(),{action}).error,'action_not_allowed');
 assert.equal(h.rows.length,2);
});
test('validates units, concentration, coordinates, dates, strings and protocol',()=>{
 const h=harness();h.c.prepararPlanilha();
 for(const patch of [{unidade:'other'},{concentracao:-1},{concentracao:''},{lat:null},{lat:91},{lng:181},{data:'2026-02-30'},{nome:' '},{contato:'x'.repeat(161)},{lat:[]},{concentracao:true}]) assert.equal(post(h,{...record(),...patch}).status,'error',JSON.stringify(patch));
 assert.equal(post(h,record(),{apiVersion:1}).error,'upgrade_required');assert.equal(h.rows.length,1);
});
test('formula-like private and public text is escaped',()=>{
 const h=harness();h.c.prepararPlanilha();post(h,{...record(),nome:'=IMPORTXML("x")',cultura:'+cmd'});
 assert.equal(h.rows[1][1][0],"'");assert.equal(h.rows[1][9][0],"'");
});
test('bad JSON, missing configuration and paused submissions fail closed',()=>{
 const h=harness();assert.equal(h.c.doGet({}).error,'setup_required');assert.equal(h.c.doPost({postData:{contents:'not json'}}).error,'invalid_json');
 h.c.prepararPlanilha();h.props.FORUM_ACCEPT_SUBMISSIONS='false';assert.equal(post(h).error,'submissions_disabled');
});
