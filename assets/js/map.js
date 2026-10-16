let map = null;
let marcadoresLayer = null;
function iniciarMapa() {
    if (!window.L) {
        document.getElementById('mapStatus').textContent = 'Não foi possível carregar o Leaflet. Verifique a conexão e recarregue a página.';
        return;
    }
    map = L.map('map').setView([-30.0346, -53], 7);
    marcadoresLayer = L.layerGroup().addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).on('tileerror', () => {
        document.getElementById('mapStatus').textContent = 'Falha ao carregar o fundo do mapa. Verifique sua conexão e recarregue.';
    }).addTo(map);
    new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));
}
function renderizarMapa() {
    if (marcadoresLayer) marcadoresLayer.clearLayers();
    const select = document.getElementById('filtroSemestre');
    const atual = select.value;
    const semestres = [...new Set(todasOcorrencias.map(p => classificarSemestre(p.data)))];
    select.replaceChildren(new Option('Todos os períodos', 'todos'));
    semestres.sort((a, b) => b.slice(-4).localeCompare(a.slice(-4)) || b.localeCompare(a));
    semestres.forEach(sem => select.add(new Option(sem, sem)));
    select.value = semestres.includes(atual) ? atual : 'todos';
    let invalidos = 0, exibidos = 0;
    todasOcorrencias.forEach(ponto => {
        if (select.value !== 'todos' && classificarSemestre(ponto.data) !== select.value) return;
        if (!coordenadasValidas(ponto.lat, ponto.lng)) { invalidos++; return; }
        exibidos++;
        if (!marcadoresLayer) return;
        const popup = document.createElement('div');
        for (const [label, value] of [['Data', formatarDataTratada(ponto.data)], ['Cultura', ponto.cultura || 'Não informada'], ['Gravidade informada', ponto.gravidade || 'Não informada'], ['Concentração medida', resultadoMedido(ponto)]]) {
            const line = document.createElement('p'); line.textContent = `${label}: ${value}`; popup.appendChild(line);
        }
        L.circleMarker([Number(ponto.lat), Number(ponto.lng)], {
            radius: 9, fillColor: getCorGravidade(ponto.gravidade), color: '#fff', weight: 1, fillOpacity: 0.9
        }).bindPopup(popup).addTo(marcadoresLayer);
    });
    document.getElementById('recordCount').textContent = `${exibidos} registro(s) com coordenadas válidas no período.` +
        (invalidos ? ` ${invalidos} registro(s) ignorado(s) por coordenadas inválidas.` : '');
}
