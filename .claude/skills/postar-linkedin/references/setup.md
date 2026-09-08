# Setup do LinkedIn (uma vez só)

Tudo aqui é gratuito. Nenhuma etapa exige aprovação do LinkedIn, plano pago ou parceria. O que
custa é o tempo: cerca de 10 minutos na primeira vez, e 2 minutos a cada renovação de token.

O que estamos usando é o produto self-serve **Share on LinkedIn**, que libera o escopo
`w_member_social`, ou seja: criar post em nome do próprio membro autenticado. Publicar na página da
empresa é outro produto (Community Management API), tem fila de aprovação e ficou de fora de
propósito.

---

## Passo 1: página da empresa no LinkedIn

O portal de developers exige que todo app seja associado a uma LinkedIn Page e verificado por um
admin dela. Se a página da Anti Custos ainda não existe, criar em
[linkedin.com/company/setup/new](https://www.linkedin.com/company/setup/new).

Não precisa estar bonita nem completa. Ela existe aqui para verificar o app. Os posts continuam
saindo do perfil pessoal.

## Passo 2: criar o app

1. Ir em [linkedin.com/developers/apps/new](https://www.linkedin.com/developers/apps/new)
2. Nome do app: `Anti Custos Publisher` (o nome não aparece no post)
3. LinkedIn Page: a página do passo 1
4. Subir um logo qualquer, aceitar os termos, criar
5. Na aba **Settings**, clicar em **Verify** e concluir a verificação. Ela abre um link que precisa
   ser aberto por um admin da página, que é o próprio Alvaro. Sem isso os produtos não liberam.

## Passo 3: adicionar os produtos

Na aba **Products** do app, adicionar os dois. Ambos são self-serve, liberam na hora, sem review:

- **Sign In with LinkedIn using OpenID Connect**, que dá `openid`, `profile` e `email`
- **Share on LinkedIn**, que dá `w_member_social`, o escopo que publica

Se algum aparecer como "Request access" e ficar pendente, é sinal de que o passo 2.5 (verificação da
página) não foi concluído.

## Passo 4: redirect URL

Na aba **Auth**, em **Authorized redirect URLs for your app**, adicionar as duas:

```
https://www.linkedin.com/developers/tools/oauth/redirect
http://127.0.0.1:8888/callback
```

A primeira é obrigatória e faz o Token Generator do portal funcionar. A segunda serve para o fluxo
automático do `auth.js --servidor`. O LinkedIn às vezes recusa URL sem https: se recusar a segunda,
tudo bem, o caminho principal é o Token Generator e ele não precisa dela.

Ainda na aba **Auth**, copiar o **Client ID** e o **Primary Client Secret**.

## Passo 5: guardar as credenciais

Criar ou editar o `.env` na raiz do workspace (o `.gitignore` já bloqueia esse arquivo, ele nunca
sobe pro GitHub):

```
LINKEDIN_CLIENT_ID=cole_aqui
LINKEDIN_CLIENT_SECRET=cole_aqui
```

Client ID e secret são opcionais para publicar, mas com eles o `status.js` consegue perguntar ao
LinkedIn a data exata de expiração do token e quais escopos ele tem. Sem eles, a validade vira
estimativa de 60 dias. Vale colar.

## Passo 6: gerar o token

Caminho principal, o mais confiável:

1. Abrir [o Token Generator](https://www.linkedin.com/developers/tools/oauth/token-generator)
2. Escolher o app `Anti Custos Publisher`
3. Marcar os escopos: `openid`, `profile`, `email`, `w_member_social`
4. Autorizar e copiar o access token gerado
5. Rodar e colar quando pedir:

```bash
node .claude/skills/postar-linkedin/scripts/auth.js
```

Caminho alternativo, se preferir não passar pelo portal (exige a redirect de 127.0.0.1 aceita no
passo 4):

```bash
node .claude/skills/postar-linkedin/scripts/auth.js --servidor
```

Abre o navegador, você autoriza, o script captura o retorno sozinho e grava tudo.

O `auth.js` grava três coisas no `.env`: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN` (o
identificador do seu perfil, descoberto sozinho) e `LINKEDIN_TOKEN_EXPIRA_EM`.

## Passo 7: conferir

```bash
node .claude/skills/postar-linkedin/scripts/status.js
```

Tem que sair o seu nome, o URN e "Pronto pra publicar". Se sair aviso de escopo faltando, refazer o
passo 6 marcando `w_member_social`.

---

## Renovação, a cada 60 dias

O token do LinkedIn dura 60 dias e refresh token programático só existe para parceiro aprovado do
Marketing Developer Platform, o que não é o nosso caso. Então a renovação é manual:

1. Gerar token novo no Token Generator
2. `node .claude/skills/postar-linkedin/scripts/auth.js` e colar

O `status.js` avisa quando faltam 7 dias ou menos. Nada mais precisa ser refeito: app, produtos e
redirect continuam valendo.

## Chaves no .env, resumo

| Chave | Obrigatória | De onde vem |
|---|---|---|
| `LINKEDIN_ACCESS_TOKEN` | sim | `auth.js` grava |
| `LINKEDIN_PERSON_URN` | sim | `auth.js` descobre pelo token |
| `LINKEDIN_TOKEN_EXPIRA_EM` | sim | `auth.js` grava |
| `LINKEDIN_CLIENT_ID` | não | aba Auth do app |
| `LINKEDIN_CLIENT_SECRET` | não | aba Auth do app |
| `LINKEDIN_API_VERSION` | não | padrão `202606`, só mexer se a API reclamar da versão |
| `LINKEDIN_REDIRECT_URI` | não | só para o modo `--servidor` com porta diferente |
