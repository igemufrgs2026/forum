async function buscarJSON(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) throw new Error(`Servidor retornou HTTP ${response.status}.`);
        let data;
        try { data = await response.json(); }
        catch { throw new Error('O servidor não retornou JSON válido. Verifique a implantação do Apps Script.'); }
        if (data && (data.error || data.success === false || data.status === 'error')) {
            const messages = { setup_required: 'Execute prepararPlanilha no Apps Script.', action_not_allowed: 'Esta operação não é permitida.', upgrade_required: 'Atualize o Apps Script para a versão 2.', submissions_disabled: 'Novos registros estão temporariamente desativados.', id_conflict: 'O identificador já existe com outros dados.', busy: 'Servidor ocupado. Tente novamente.', invalid_number: 'Verifique concentração e coordenadas.', invalid_date: 'Confira a data da coleta.', invalid_unit: 'Unidade não aceita.' };
            throw new Error(messages[data.error] || 'O servidor recusou a operação. Verifique os dados e a configuração do backend.');
        }
        return data;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('Tempo de conexão esgotado. Tente novamente.');
        throw error;
    } finally { clearTimeout(timer); }
}
function urlVersionada() {
    const url = new URL(CONFIG.apiUrl); url.searchParams.set('apiVersion', '2'); return url.href;
}
let backendPronto = false;
async function obterOcorrencias() {
    backendPronto = false;
    const data = await buscarJSON(CONFIG.demo ? 'data/demo.json' : urlVersionada());
    if (CONFIG.demo) {
        if (!Array.isArray(data)) throw new Error('A demonstração deve retornar uma lista de registros.');
        return data;
    }
    if (!data || data.apiVersion !== 2 || !Array.isArray(data.records)) {
        throw new Error('A planilha ainda usa o Apps Script antigo. Atualize a implantação para ativar leitura pública protegida e medições. Use a demonstração enquanto isso.');
    }
    backendPronto = true;
    return data.records;
}
async function enviarOcorrencia(ponto) {
    if (CONFIG.demo) return;
    if (!backendPronto) await obterOcorrencias();
    const result = await buscarJSON(CONFIG.apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'add', apiVersion: 2, dados: ponto })
    });
    if (!result || result.status !== 'success' || result.apiVersion !== 2 || result.id !== ponto.id) {
        throw new Error('O servidor não confirmou o salvamento. Confira os registros antes de tentar novamente.');
    }
}
let ultimaBusca = 0;
const cacheEnderecos = new Map();
async function localizarEndereco(endereco) {
    const key = endereco.trim().toLowerCase();
    if (cacheEnderecos.has(key)) return cacheEnderecos.get(key);
    if (Date.now() - ultimaBusca < 1100) throw new Error('Aguarde um instante antes de buscar novamente.');
    ultimaBusca = Date.now();
    const results = await buscarJSON('https://nominatim.openstreetmap.org/search?' +
        new URLSearchParams({ format: 'json', q: endereco, countrycodes: 'br', limit: '1' }));
    if (!Array.isArray(results) || !results.length) throw new Error('Endereço não encontrado. Informe município e estado ou use coordenadas.');
    const point = { lat: Number(results[0].lat), lng: Number(results[0].lon), label: results[0].display_name };
    if (!coordenadasValidas(point.lat, point.lng)) throw new Error('A busca retornou coordenadas inválidas.');
    cacheEnderecos.set(key, point);
    return point;
}
