# Validação v2

- 19 testes aprovados: 11 do frontend e 8 do backend executado em ambiente Node com serviços Google simulados.
- Migração preserva registros legados e recusa colunas ocupadas; projeção pública não contém nome/contato/endereço/serial.
- Update/delete/ações desconhecidas recusados; validação de data, números, unidade e textos; escape de fórmulas; repetição idempotente de cadastro.
- Frontend bloqueia POST contra backend antigo e distingue zero de ausência de medição.
- Navegador: cadastro fictício de 0,002 mg/mL no modo demo, quatro marcadores após inclusão e resultado/unidade confirmados no popup.
- Captura: screenshots/measurement-v2.png.

Não executado: migração ou cadastro na planilha real, atualização da implantação Google e teste das permissões dessa conta. Os serviços Google foram simulados nos testes, não substituem validação na implantação.
