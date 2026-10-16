# iGEM UFRGS · Plataforma comunitária de relatos

Registro manual de observações do biossensor de 2,4-D, organizado por local e data, para agricultores brasileiros.

[English](README.md) · [Site publicado](https://igemufrgs2026.github.io/forum/) · [Configuração](docs/setup.md)

**Protótipo com dados fictícios.** Os registros atuais não representam medições reais nem evidências de contaminação. Esta revisão local só chegará ao site depois de publicada.

## Executar

```sh
python3 -m http.server 8000
```

Abra `http://localhost:8000/?demo=1`. Os registros adicionados nessa demonstração ficam apenas na memória da página. Recarregar restaura os exemplos. Mapa e busca de endereços precisam de internet.

Execute `npm test` com Node.js 18 ou superior, sem instalar dependências.

## Funcionalidades

Mapa, filtro por semestre, legenda de gravidade, cadastro por endereço ou coordenadas, exportação CSV do período selecionado e mensagens de falha. Dados pessoais não fazem parte do CSV público; a resposta da API também precisa ser auditada pelo responsável pelo backend.

Não há envio automático pelo ESP32. Concentração e unidade foram implementadas no formulário, API, mapa e CSV; a gravação depende de atualizar a implantação do Apps Script. A gravidade é declarada pelo usuário.

## Próximos passos

1. Atualizar a implantação do Apps Script seguindo [este guia](backend/apps-script/README.md), mantendo a planilha original.
2. Validar um registro fictício na planilha e confirmar que o GET não expõe campos privados.
3. Implementar moderação e proteção contra abuso antes de ampliar o uso público.
4. Evoluir lista sincronizada ao mapa e filtros.

Veja a [arquitetura](docs/architecture.md), o [dicionário dos dados](docs/data-dictionary.md) e o [guia de contribuição](CONTRIBUTING.md).
