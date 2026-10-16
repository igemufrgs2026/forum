# Configuração e execução

## Desenvolvimento local

Sirva a raiz com `python3 -m http.server 8000` e abra `http://localhost:8000/?demo=1`.
Não abra o HTML por `file://`: o carregamento do JSON local e as políticas de rede dependem de uma origem HTTP.
Use `npm test` para executar testes com Node.js 18+.

## Planilha existente

`assets/js/config.js` conserva a URL pública original. Abra `/` sem `?demo=1` para consultá-la.
Nenhuma credencial deve ser colocada nesse arquivo. Base64 não protege uma URL nem uma senha.
O frontend exige API v2: veja [contrato](api.md) e [atualização do Apps Script](../backend/apps-script/README.md).
O backend existente precisa ser conferido: HTTP 200 sozinho não confirma que uma linha foi salva.
Se a confirmação for inesperada, confira a planilha antes de reenviar para evitar duplicatas.

## Falha no mapa

- Mensagem sobre Leaflet: conferir CDN `unpkg.com`, rede e bloqueadores.
- Mensagem sobre fundo do mapa: conferir requests a `tile.openstreetmap.org`.
- Mensagem sobre registros: conferir GET do Apps Script na aba Network; verificar JSON, redirecionamentos, permissões e CORS.
- Coordenadas ignoradas: corrigir latitude/longitude no backend; valores vazios não são coordenadas zero.
- Busca sem resultado: informar município e estado ou preencher coordenadas. A busca está limitada ao Brasil.

Não usar `mode: "no-cors"`: isso impede que a aplicação leia e valide a resposta.
O Nominatim público limita o uso agregado por aplicação, não somente por navegador; o bloqueio local de 1,1 segundo e cache desta versão não substituem um proxy com controle global em escala.
Consultar a [política do serviço](https://operations.osmfoundation.org/policies/nominatim/).

## Publicação

Esta revisão não publica automaticamente. O workflow `checks.yml` apenas executa testes.
Após revisão, configurar o GitHub Pages para servir a raiz da branch escolhida, preservando a configuração existente quando aplicável.
Testar caminhos de assets sob `/forum/`, modo demo, carregamento real, cadastro em backend de testes e exportação antes de promover.

## Provedor do fundo

Na verificação visual, a camada CARTO antiga exibiu “API KEY REQUIRED”. Esta revisão usa tiles padrão do OpenStreetMap com atribuição, sem pré-carregamento ou download em massa. Respeitar cache e Referer do navegador; revisar a [política de tiles](https://operations.osmfoundation.org/policies/tiles/) antes de ampliar o uso. O serviço público não oferece garantia de disponibilidade.
