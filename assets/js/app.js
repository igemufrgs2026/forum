let todasOcorrencias = [];
function mostrarStatus(message) { document.getElementById('dataStatus').textContent = message; }
async function carregarDadosDaPlanilha() {
    const button = document.getElementById('retryData'); button.disabled = true;
    mostrarStatus('Carregando registros…');
    try {
        todasOcorrencias = (await obterOcorrencias()).filter(p => p && typeof p === 'object' && !Array.isArray(p));
        renderizarMapa();
        mostrarStatus(CONFIG.demo ? 'Demonstração local: registros fictícios; alterações duram até recarregar a página.' : 'Registros carregados. Os dados atuais são exemplos fictícios.');
    } catch (error) { mostrarStatus(`Não foi possível atualizar os registros: ${error.message} Você pode tentar novamente ou abrir a demonstração.`); }
    finally { button.disabled = false; }
}
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content, .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active'); btn.classList.add('active');
    if (tabId === 'mapaTab' && map) requestAnimationFrame(() => map.invalidateSize());
}
document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab, btn)));
document.getElementById('downloadData').addEventListener('click', baixarDadosPublicos);
document.getElementById('retryData').addEventListener('click', carregarDadosDaPlanilha);
document.getElementById('filtroSemestre').addEventListener('change', renderizarMapa);
iniciarMapa(); iniciarFormulario(); carregarDadosDaPlanilha();
