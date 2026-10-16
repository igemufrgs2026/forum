function iniciarFormulario() {
    const form = document.getElementById('registroForm');
    let pendingId = null;
    form.addEventListener('input', () => { pendingId = null; });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('[type="submit"]');
        if (button.disabled) return;
        button.disabled = true;
        const feedback = document.getElementById('loadingMsg');
        feedback.style.display = 'block'; feedback.textContent = 'Processando informações…';
        try {
            const value = id => document.getElementById(id).value.trim();
            const lat = value('latitude'), lng = value('longitude');
            let location;
            if (lat || lng) {
                if (!coordenadasValidas(lat, lng)) throw new Error('Informe latitude entre -90 e 90 e longitude entre -180 e 180.');
                location = {lat: Number(lat), lng: Number(lng)};
            } else {
                location = await localizarEndereco(value('endereco'));
                if (!confirm(`Local encontrado: ${location.label}. Confirma o local da coleta?`)) { feedback.style.display = 'none'; return; }
            }
            if (!pendingId) pendingId = 'ID-' + crypto.randomUUID();
            const concentracao = Number(value('concentracao'));
            if (value('concentracao') === '' || !Number.isFinite(concentracao) || concentracao < 0) throw new Error('Informe uma concentração válida, maior ou igual a zero.');
            const ponto = { id: pendingId, nome: value('nome'), contato: value('contato'),
                serial: value('serial'), cultura: value('cultura'), data: value('data'), endereco: value('endereco'),
                gravidade: value('gravidade'), lat: location.lat, lng: location.lng, concentracao, unidade: value('unidade') };
            if ([ponto.nome, ponto.contato, ponto.serial, ponto.cultura, ponto.endereco].some(v => !v)) throw new Error('Preencha os campos com texto válido.');
            await enviarOcorrencia(ponto);
            todasOcorrencias.push(ponto);
            document.getElementById('filtroSemestre').value = 'todos';
            renderizarMapa(); form.reset(); pendingId = null;
            switchTab('mapaTab', document.querySelector('.tab-btn'));
            if (map) map.flyTo([ponto.lat, ponto.lng], 12);
            mostrarStatus(CONFIG.demo ? 'Registro de demonstração adicionado somente nesta página. Será perdido ao recarregar.' : 'Servidor confirmou o registro.');
        } catch (error) {
            feedback.textContent = error.message + ' Os campos foram preservados.';
            return;
        } finally { button.disabled = false; }
        feedback.style.display = 'none';
    });
}
