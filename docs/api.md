# API v2

## Leitura

`GET /exec?apiVersion=2` retorna `{"apiVersion":2,"records":[...]}`.
Cada registro contém somente id, data, cultura, gravidade, lat, lng, concentracao e unidade.
O GET sem parâmetro mantém o formato array para leitores antigos, com a mesma projeção pública.
Nome, contato, endereço e serial não são retornados em nenhuma variante.

## Cadastro

POST com `Content-Type: text/plain;charset=utf-8`:

```json
{"apiVersion":2,"action":"add","dados":{"id":"ID-12345678-abcd","nome":"Exemplo fictício","contato":"exemplo@example.invalid","serial":"DEMO-001","cultura":"Uva","data":"2026-03-10","endereco":"Local fictício","gravidade":"Baixa","lat":-29.17,"lng":-51.52,"concentracao":0.002,"unidade":"mg/mL"}}
```

Sucesso: `{"status":"success","apiVersion":2,"id":"ID-12345678-abcd"}`.
Erro: `{"status":"error","apiVersion":2,"error":"invalid_unit"}`.
Apps Script retorna erros de aplicação em JSON; HTTP 200 não basta.
O frontend exige versão e ID correspondentes antes de confirmar o registro.

Somente `add` é permitido. Update/delete e ações desconhecidas são recusados antes de acessar a planilha. O servidor valida data real, textos, limites de coordenadas, concentração finita não negativa e unidade explícita. Textos que poderiam virar fórmulas são gravados como texto.
Escritas usam lock. Reenvio do mesmo ID/payload é idempotente; ID igual com outro conteúdo retorna `id_conflict`.
O cliente mantém o ID após erro enquanto o formulário não for alterado, e não repete POST automaticamente. Depois de erro de rede, alterar campos ou recarregar cria novo ID; confira a planilha antes de reenviar nesse caso.

## Compatibilidade

O frontend bloqueia gravações no Apps Script antigo, que ignoraria os campos de medição. A verificação de versão não altera nem protege a implantação antiga: a atualização do código publicado no Google é obrigatória.
