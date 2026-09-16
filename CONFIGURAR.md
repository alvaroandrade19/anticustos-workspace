# Passo a passo para colocar no ar

Estado de hoje: o código está pronto e testado. O que falta é **configuração de
ambiente**, e nada disso dá para eu fazer por você, porque depende de contas suas.

Leia primeiro o aviso abaixo. Ele é a razão de este documento existir.

> **A falha que não aparece.** Se a rota `/api/lead` não estiver ligada ao Worker,
> o quiz continua funcionando perfeitamente na tela, a pessoa responde tudo, vê o
> resultado, clica no WhatsApp, e **nenhum lead é gravado em lugar nenhum**. O erro
> de rede é engolido de propósito, para uma queda do Worker não travar quem está
> respondendo. Por isso o passo 6 existe, e por isso não suba mídia paga antes dele.

Tempo estimado: 30 a 40 minutos, quase tudo esperando comando rodar.

---

## Antes de começar

Você vai precisar de:

- Conta na **Cloudflare** (grátis) para o Worker e o banco KV
- Conta na **Vercel** (grátis) para o site
- **Telegram** no celular, para receber o aviso de lead novo
- **Node.js** instalado (já está, porque os verificadores rodam)

Em todos os comandos, rode a partir da pasta do projeto.

---

## Passo 1. Criar o banco KV

O KV é onde os leads ficam guardados. É grátis até 100 mil leituras por dia, o que
você não vai chegar perto.

```bash
cd workers/quiz-leads
npx wrangler login
npx wrangler kv namespace create QUIZ_KV
```

Se o `wrangler` for antigo e reclamar do comando, tente `npx wrangler kv:namespace create QUIZ_KV`.

Ele vai imprimir algo assim:

```
[[kv_namespaces]]
binding = "QUIZ_KV"
id = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
```

**Copie esse `id`** e cole em `workers/quiz-leads/wrangler.toml`, no lugar de
`COLE_AQUI_O_ID_DO_NAMESPACE`. A linha fica assim:

```toml
kv_namespaces = [
  { binding = "QUIZ_KV", id = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6" }
]
```

---

## Passo 2. Criar o bot do Telegram

Esta é a parte que faz o lead chegar em você em menos de 30 segundos. Sem ela o
lead é gravado e dorme, e lead que dorme é lead morto.

1. No Telegram, procure **@BotFather** e mande `/newbot`
2. Ele pede um nome (ex: `Anti Custos Leads`) e um usuário terminado em `bot`
   (ex: `anticustos_leads_bot`)
3. Ele devolve um token parecido com `7812345678:AAH...`. **Guarde.**

Agora o ID do seu chat:

4. Procure o bot que você acabou de criar e **mande qualquer mensagem para ele**

> **Isto não é opcional.** O Telegram proíbe bot de iniciar conversa. Se você não
> mandar a primeira mensagem, o bot nunca vai conseguir te avisar, e o erro é
> silencioso: o lead grava normalmente e o aviso simplesmente não chega.

5. Abra no navegador, trocando pelo seu token:
   `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
6. Procure `"chat":{"id":123456789` e **guarde esse número**

---

## Passo 3. Guardar os segredos no Worker

Segredos não entram em arquivo, porque arquivo vai para o repositório.

```bash
cd workers/quiz-leads

npx wrangler secret put LEADS_ACCESS_TOKEN
# cole uma senha longa que você inventar. Serve para ler a lista de leads.
# Guarde num gerenciador de senhas, ela não aparece em lugar nenhum depois.

npx wrangler secret put TELEGRAM_BOT_TOKEN
# cole o token do passo 2

npx wrangler secret put TELEGRAM_CHAT_ID
# cole o número do passo 2
```

Sem `LEADS_ACCESS_TOKEN`, o endereço que lista os leads responde 401 sempre. É de
propósito: ele fecha por omissão em vez de abrir.

---

## Passo 4. Publicar o Worker

```bash
cd workers/quiz-leads
npx wrangler deploy
```

Ele imprime a URL, algo como:

```
Published quiz-leads
  https://quiz-leads.alvaro.workers.dev
```

**Copie o endereço.** Você precisa dele no próximo passo.

---

## Passo 5. Apontar o site para o Worker

Um comando só, e ele arruma os quatro arquivos que precisam saber desses valores:

```bash
node scripts/configurar.js \
  --worker quiz-leads.alvaro.workers.dev \
  --site https://anticustos.vercel.app \
  --whatsapp 5511996758975

node scripts/sync-diagnostico.js
```

Troque pelos seus valores:

| Parâmetro | O que é | Onde vai parar |
|---|---|---|
| `--worker` | O endereço do passo 4, sem `https://` | rotas do `vercel.json` |
| `--site` | O domínio final do site | `og:url`, `og:image`, `canonical` e `ALLOWED_ORIGINS` |
| `--whatsapp` | Seu número com DDD | texto do botão e link de reserva |

O script aceita o WhatsApp em qualquer formato: `(11) 99675-8975` ou
`5511996758975` dão no mesmo, ele normaliza e coloca o `55` se faltar.

**Se você for usar domínio próprio** em vez de `anticustos.vercel.app`, passe o
domínio próprio em `--site` e depois rode de novo `npx wrangler deploy` dentro de
`workers/quiz-leads`, porque o `ALLOWED_ORIGINS` mudou.

Confira o que ficou:

```bash
node scripts/configurar.js
```

Sem argumentos ele só mostra a configuração atual e diz o que ainda falta.

---

## Passo 6. Publicar o site e conferir de ponta a ponta

```bash
npx vercel --prod
```

Agora o passo que fecha tudo. Este comando **grava um lead de teste de verdade** e
confere que ele chegou no KV e voltou na leitura:

```bash
node scripts/verificar-deploy.js https://anticustos.vercel.app SEU_LEADS_ACCESS_TOKEN
```

Todos os itens precisam dar `OK`. Se o `POST /api/lead` der **404**, é a falha
silenciosa do começo deste documento: a rota não está chegando no Worker. Volte ao
passo 5.

Depois, apague o lead de teste (ele aparece com o nome `TESTE-DEPLOY-...`).

---

## Passo 7. Conferir o Pixel

O Pixel `1175560701016650` já está na página, mas o critério 9 do PRD pede que os
cinco eventos sejam vistos disparando de verdade.

1. Abra o **Gerenciador de Eventos** da Meta, aba **Testar eventos**
2. Cole a URL `https://SEU_DOMINIO/diagnostico` e abra
3. Responda o quiz inteiro, com calma
4. Confira que apareceram, nesta ordem:

| Evento | Quando |
|---|---|
| `ViewContent` | ao abrir |
| `QuizStart` | ao enviar nome e WhatsApp |
| `QuizStep` | uma vez por pergunta, seis no total |
| `Lead` | ao chegar no resultado |
| `Contact` | ao clicar no botão do WhatsApp |

Nesse mesmo teste você confirma o passo 2: o aviso do Telegram tem que chegar em
menos de 30 segundos da hora em que você enviou o nome.

---

## Passo 8. Ler os leads

```bash
LEADS_ACCESS_TOKEN=seu_token node scripts/ler-leads.js https://quiz-leads.alvaro.workers.dev
```

Gera um CSV com acentuação certa para abrir direto no Excel. Esse CSV é o seu CRM
mínimo enquanto não houver outro.

---

## O que ainda é decisão sua, não configuração

Estes três não impedem nada de funcionar, mas o primeiro é o único item da página
que faz afirmação sobre tratamento de dado.

### 1. A linha de consentimento

O texto que está no ar é rascunho meu. O PRD diz que só você escreve essa frase.
Há três redações prontas no `README.md`, na seção "A linha de consentimento".
Escolha uma, cole em `index.html` na classe `consent-text`, rode o sync.

**Cuidado com uma palavra.** O rascunho atual diz que os dados são usados
"exclusivamente" para o diagnóstico. Isso fecha a porta para qualquer envio futuro
de conteúdo. Se você pretende nutrir a lista depois, precisa dizer agora, senão o
primeiro envio vira uso não declarado.

### 2. O prazo de instalação

Continua em aberto no PRD e nenhuma promessa de prazo entrou na página, porque
inventar prazo é o tipo de afirmação que o acervo proíbe. O bloco final fala de
escopo, não de data. Se quiser prometer prazo, me diga qual e eu coloco.

### 3. A paleta do criativo do anúncio

A página está em Terra, terracota sobre papel. Se o anúncio continuar azul, quem
clica sai do azul frio e cai no barro quente, e em tráfego frio essa
descontinuidade custa confiança. O `design-system-terra.md` recomenda levar o
criativo junto, e eu concordo: terracota destoa de todo concorrente de IA, que
vive no azul de SaaS, e destoar ajuda justamente onde o objetivo é parar o scroll.

---

## Conferir tudo de novo, a qualquer momento

```bash
node scripts/configurar.js            # o que está configurado e o que falta
node scripts/verificar-criterios.js   # os critérios da seção 11 do PRD
node scripts/verificar-responsivo.js  # 8 etapas em 7 larguras, de 320px a 1440px
node scripts/verificar-deploy.js <URL> <TOKEN>   # o caminho do lead, de verdade
```

Enquanto o passo 5 não estiver feito, o `verificar-criterios` falha de propósito
no item da rota. É a única falha esperada.
