function celulaCSV(value) {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
}
function criarCSV(rows, columns) {
    return '\uFEFF' + [columns.map(celulaCSV).join(';'), ...rows.map(row => columns.map(col => celulaCSV(row[col])).join(';'))].join('\r\n');
}
function baixarDadosPublicos() {
    const filtro = document.getElementById('filtroSemestre').value;
    const rows = todasOcorrencias.filter(p => filtro === 'todos' || classificarSemestre(p.data) === filtro)
        .sort((a, b) => String(a.data).localeCompare(String(b.data)))
        .map(p => ({ Data: formatarDataTratada(p.data), Cultura: p.cultura, Latitude: p.lat, Longitude: p.lng, Gravidade: p.gravidade, Concentracao: p.concentracao ?? '', Unidade: p.unidade ?? '' }));
    if (!rows.length) { mostrarStatus('Não há registros para exportar neste período.'); return; }
    const url = URL.createObjectURL(new Blob([criarCSV(rows, ['Data', 'Cultura', 'Latitude', 'Longitude', 'Gravidade', 'Concentracao', 'Unidade'])], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url;
    link.download = CONFIG.demo ? 'demonstracao-forum.csv' : 'registros-forum.csv';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
