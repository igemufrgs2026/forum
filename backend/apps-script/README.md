# Atualizar a mesma planilha — Apps Script v2

O arquivo [Code.gs](Code.gs) substitui os `doGet` e `doPost` originais. Mantém a planilha, os registros e as dez colunas existentes. Acrescenta **K: Concentração** e **L: Unidade**; linhas antigas continuam sem resultado, não viram zero.

## O que fazer na conta do time

1. Faça uma cópia de segurança da planilha pelo menu Arquivo. Guarde também o código original.
2. Abra a planilha original no navegador com a conta do time → **Extensões → Apps Script**. Também é possível localizar o projeto em https://script.google.com/home.
3. Substitua o conteúdo do arquivo que contém os `doGet`/`doPost` pelo conteúdo completo de `Code.gs`. Não deixe duas definições dessas funções em outros arquivos. Preserve outros scripts não relacionados.
4. Salve. Selecione **prepararPlanilha** no seletor de funções e execute uma vez no editor. Autorize o acesso à planilha usando a conta do time. A função não é chamada pela API pública.
5. Confira A:J: ID, Nome, Contato, Data, Endereço, Gravidade, Latitude, Longitude, Serial, Cultura. O script aceita aliases comuns, como lat/lng. Se avisar cabeçalho inesperado, confira a posição indicada antes de renomear qualquer coluna. Se K:L estiverem ocupadas por outros dados, pare: o script recusa sobrescrevê-las.
6. **Implantar → Gerenciar implantações → selecione a implantação existente → Editar (lápis) → Versão: Nova versão → Implantar.** Preserve a URL `/exec` atual. Salvar no editor sozinho não atualiza a versão pública.
7. Confirme que a URL do `assets/js/config.js` continua sendo a dessa implantação. Se houver outras implantações antigas públicas, atualize-as ou arquive-as: elas podem continuar executando o código antigo.
8. Abra o fórum sem `?demo=1`. A mensagem de servidor antigo deve desaparecer. Verifique uma leitura antes de fazer um cadastro fictício de teste.

A implantação pública precisa continuar executando como o proprietário, com a configuração de acesso apropriada ao site público. Não torne a planilha pública. Execute o cadastro de teste somente após conferir o código, a aba e a resposta pública.

## Verificação

Acrescente `?apiVersion=2` à URL `/exec`. A resposta deve conter `apiVersion: 2` e `records`. Nenhum registro público deve conter nome, contato, endereço ou serial.
Cadastre um exemplo claramente fictício, confira concentração/unidade em K:L e no mapa, e remova a linha de teste diretamente na planilha com a conta autorizada.

## Administração

Não há senha no frontend ou token administrativo compartilhado. A API recusa `update`, `delete` e ações desconhecidas. Correções/exclusões são feitas diretamente no Google Sheets por editores autorizados. Isso elimina a rota pública destrutiva, sem criar um novo mecanismo frágil de login.

A configuração registra `FORUM_SPREADSHEET_ID` e `FORUM_SHEET_ID` nas propriedades do script, para não trocar de aba quando alguém reorganizar as guias. `FORUM_ACCEPT_SUBMISSIONS=false` pausa cadastros; a leitura pública continua disponível.

## Limites

O formulário continua aceitando contribuições públicas. Validação e lock não são proteção completa contra spam: moderação/rate limiting/CAPTCHA no servidor ainda são evoluções necessárias para maior exposição. Coordenadas continuam públicas por finalidade do mapa; decidir a precisão antes de coletar dados reais.
O patch não limpa dados já acessados/publicados pela versão antiga. Restringir compartilhamento da planilha e atualizar todas as implantações antigas faz parte da correção operacional.

Referência: https://developers.google.com/apps-script/concepts/deployments
