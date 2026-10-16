# Arquitetura

Aplicação estática sem build/framework. Scripts com defer executam em ordem: configuração, utilitários, API, mapa, exportação, formulário e inicialização. Ainda compartilham escopo global para simplificar a migração.

O frontend se conecta à mesma URL Apps Script. Consulta `apiVersion=2` para evitar gravação silenciosa em servidor antigo. A API v2 faz projeção pública explícita, valida registros e permite somente adicionar; administração usa permissões do Google Sheets. Não existe login administrativo no navegador.

O script vinculado à planilha é versionado em backend/apps-script/Code.gs. A configuração executada pelo editor preserva A:J, acrescenta K:L se livres, e fixa a aba por ID. A implantação Google precisa ser atualizada separadamente do GitHub Pages.

Um lock serializa a verificação de IDs e append; mesmo ID/payload não gera outra linha. Erros não expõem detalhes internos do servidor.

Demonstração usa fixtures locais e adições em memória; não envia POST, mas mapa e geocodificação usam serviços externos.

Concentração e unidade circulam no formulário, API, planilha, popup e CSV. Medições antigas sem resultado permanecem distintas de zero. Não há integração automática com ESP32 nem gravidade calculada.
