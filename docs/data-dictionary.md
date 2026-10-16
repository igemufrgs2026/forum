# Dicionário de dados

| Coluna | Campo | Regra | Público |
| --- | --- | --- | --- |
| A | id | ID único; reenvio idempotente | Sim |
| B | nome | Texto obrigatório, até 120 caracteres | Não |
| C | contato | Texto obrigatório, até 160 caracteres | Não |
| D | data | Data real YYYY-MM-DD | Sim |
| E | endereco | Texto obrigatório, até 240 caracteres | Não |
| F | gravidade | Baixa, Média, Alta, Extrema; informada pelo usuário | Sim |
| G | lat | Número de -90 a 90 | Sim |
| H | lng | Número de -180 a 180 | Sim |
| I | serial | Texto obrigatório, até 60 caracteres | Não |
| J | cultura | Texto obrigatório, até 80 caracteres | Sim |
| K | concentracao | Número finito >= 0 | Sim |
| L | unidade | mg/mL, µg/L ou mg/L | Sim |

Linhas antigas com K:L vazias são retornadas com concentracao/unidade null e exibidas como resultado não informado. Zero é uma medição válida. Não há conversão de unidade nem classificação automática de gravidade.
O CSV exporta os campos públicos do período selecionado, incluindo concentração/unidade. Nunca compara automaticamente medições de unidades distintas.
