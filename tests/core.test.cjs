const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
function context(files, extra = {}) {
    const sandbox = vm.createContext({ ...extra });
    for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, 'assets/js', file), 'utf8'), sandbox);
    return sandbox;
}
test('invalid coordinates do not become points at zero or outside the world', () => {
    const c = context(['utils.js']);
    for (const pair of [[null,0],['',0],[' ',1],['invalid',1],[91,0],[0,-181]]) assert.equal(c.coordenadasValidas(...pair), false);
    assert.equal(c.coordenadasValidas(0,0), true);
    assert.equal(c.coordenadasValidas('-30.03','-51.22'), true);
});
test('CSV preserves zero, escapes quotes and guards formula prefixes', () => {
    const c = context(['export.js']);
    assert.equal(c.celulaCSV(0), '"0"');
    assert.equal(c.celulaCSV('a"b'), '"a""b"');
    for (const s of ['=SUM(1,2)',' +cmd','@x','-2']) assert.ok(c.celulaCSV(s).startsWith('"\''));
    assert.ok(c.criarCSV([{A:0}], ['A']).includes('"0"'));
});
test('semester classification includes boundaries and legacy timestamps', () => {
    const c = context(['utils.js']);
    assert.equal(c.classificarSemestre('2026-06-30T00:00:00Z'),'1º Sem 2026');
    assert.equal(c.classificarSemestre('2026-07-01'),'2º Sem 2026');
});
function api(fetch, demo = false, timeoutMs = 100) {
    return context(['api.js'], {fetch, CONFIG:{demo, apiUrl:'https://example.invalid',timeoutMs}, AbortController,setTimeout,clearTimeout,URLSearchParams,URL});
}
test('API rejects HTTP errors, malformed JSON and server refusals', async () => {
    await assert.rejects(api(async()=>({ok:false,status:403})).buscarJSON('/'), /403/);
    await assert.rejects(api(async()=>({ok:true,json:async()=>{throw new Error();}})).buscarJSON('/'), /JSON/);
    await assert.rejects(api(async()=>({ok:true,json:async()=>({success:false})})).buscarJSON('/'), /recusou/);
});
test('GET validates its collection shape', async () => {
    await assert.rejects(api(async()=>({ok:true,json:async()=>({})})).obterOcorrencias(), /Apps Script antigo/);
});
test('demo writes never call fetch', async () => {
    let calls = 0;
    await api(async()=>{calls++;}, true).enviarOcorrencia({});
    assert.equal(calls,0);
});
test('write needs version and matching ID acknowledgement', async () => {
    const c = api(async (url,options) => ({ok:true,json:async()=>options.method ? {status:'success',apiVersion:2,id:'other'} : {apiVersion:2,records:[]}}));
    await assert.rejects(c.enviarOcorrencia({id:'expected'}), /confirmou/);
    const good=api(async (url,options)=>({ok:true,json:async()=>options.method ? {status:'success',apiVersion:2,id:'expected'} : {apiVersion:2,records:[]}}));
    await good.enviarOcorrencia({id:'expected'});
});
test('old backend blocks writes', async () => {
    let writes=0;
    const c=api(async(url,options)=>{if(options.method) writes++;return {ok:true,json:async()=>[]};});
    await assert.rejects(c.enviarOcorrencia({}), /Apps Script antigo/);
    assert.equal(writes,0);
});
test('zero measurement is distinct from missing legacy value', () => {
    const c=context(['utils.js']);
    assert.equal(c.resultadoMedido({concentracao:0,unidade:'mg/mL'}),'0 mg/mL');
    assert.match(c.resultadoMedido({}),/Não informado/);
});
test('timeout aborts the request', async () => {
    const c=api((url, options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>{const e=new Error();e.name='AbortError';reject(e);})),false,5);
    await assert.rejects(c.buscarJSON('/'), /esgotado/);
});
test('all local HTML assets exist and all scripts parse', () => {
    const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
    for (const match of html.matchAll(/(?:src|href)="(assets\/[^"?]+)"/g)) assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);
    for (const file of fs.readdirSync(path.join(root,'assets/js'))) new vm.Script(fs.readFileSync(path.join(root,'assets/js',file),'utf8'));
});
