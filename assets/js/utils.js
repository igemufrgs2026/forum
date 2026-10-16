function formatarDataTratada(dataRaw) {
            if (!dataRaw) return "Sem data";
            const dataLimpa = String(dataRaw).substring(0, 10);
            const partes = dataLimpa.split('-');
            if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
            return dataRaw;
        }

        function classificarSemestre(dataRaw) {
            if (!dataRaw) return "Desconhecido";
            const dataLimpa = String(dataRaw).substring(0, 10);
            const p = dataLimpa.split('-');
            if(p.length !== 3) return "Desconhecido";
            return `${parseInt(p[1]) <= 6 ? '1º Sem' : '2º Sem'} ${p[0]}`;
        }

        function getCorGravidade(nivel) {
            const cores = { 'Baixa': '#22c55e', 'Média': '#eab308', 'Alta': '#f97316', 'Extrema': '#ef4444' };
            return cores[nivel] || '#3b82f6';
        }


function coordenadasValidas(lat, lng) {
    return lat !== null && lng !== null && String(lat).trim() !== '' && String(lng).trim() !== '' &&
        Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
        Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;
}

function resultadoMedido(ponto) {
    if (ponto.concentracao === null || ponto.concentracao === undefined || ponto.concentracao === '' || !Number.isFinite(Number(ponto.concentracao)) || !ponto.unidade) return 'Não informado (registro legado)';
    return `${Number(ponto.concentracao).toLocaleString('pt-BR', {maximumSignificantDigits: 15})} ${ponto.unidade}`;
}
