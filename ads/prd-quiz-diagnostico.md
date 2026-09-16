# PRD: Quiz de Diagnóstico, substituindo a página de vendas como destino de tráfego pago

Versão 1. Data: 2026-09-15.
Origem: `C:\Users\aandr\OneDrive\Área de Trabalho\ASIMOV DESIGN\ASSETS\index.html`, hoje no ar em `anticustos.vercel.app`.
Análise que motivou: `ads/analise-pagina-vendas.md` (nota 4,4/10).

---

## 1. O que estamos construindo e por quê

Um quiz de 7 etapas em HTML estático que captura o lead na primeira tela, faz seis perguntas sobre um processo operacional do negócio dele, calcula quantas horas por semana esse processo consome hoje e entrega a conta aberta na tela, com a conversa continuando no WhatsApp já com o diagnóstico na primeira mensagem.

**A razão de ser melhor que a página atual não é estética.** Com tráfego frio no nível 1 ou 2 de consciência, a página afirma o problema e o quiz faz a pessoa descobrir sozinha, que é a ponte da epifania funcionando por construção. E ele resolve de graça o buraco maior da página, que é prova zero: o número do resultado sai dos dados que a própria pessoa digitou, então é conta aberta com a base à mostra, a única forma de número que a marca se permite, e nada precisa ser fabricado.

Ganho secundário que vale tanto quanto: **o quiz é o instrumento de pesquisa que falta.** O acervo registra que não existe pesquisa de audiência e que o mínimo são 30 a 50 conversas. Cada resposta coletada é um ponto na distribuição real de dor do ICP, inclusive a pergunta 6, que coleta histórias de terror, que é de onde sai o vilão externo de toda copy futura.

### Um funil de cada vez

A regra é um funil de cada vez até 100k. Então **o quiz passa a ser o único destino de tráfego pago**, em `/diagnostico`. A página atual para de receber mídia e continua acessível para link de bio e orgânico, recebendo apenas os três consertos que a impedem de ser passivo (nome NEXUS AI, barra de 40% OFF, números sem fonte). Se em 60 dias ela não gerar nada por orgânico, é retirada.

### Não é objetivo desta versão

Sequência de email, nutrição, integração com CRM, Conversions API server-side, infraestrutura de teste A/B, dashboard próprio, e qualquer cobrança na página. Preço não entra em página que recebe tráfego frio, porque a regra de vendas é não passar preço antes de ancorar valor, e o achado registrado é que frio para página com a variante cara deu zero venda.

---

## 2. Decisões de produto, com o porquê

| Decisão | Escolha | Razão |
|---|---|---|
| Ordem da captura | **Nome e WhatsApp na etapa 0**, antes das perguntas | Pedido do Alvaro, e correto: é o que permite salvar resposta parcial de quem abandona no meio. Sem captura na frente, abandono vira evento de Pixel e nunca vira telefone |
| Campos na captura | Apenas nome e WhatsApp | O guia manda menos campo, e diz literalmente que nome e WhatsApp bastam para abrir conversa. Email sem sequência montada custa conversão e não entrega nada hoje |
| Volume e tempo | **Entrada numérica com slider**, sem faixas | Faixa obriga a adotar um ponto médio inventado. Número digitado por ele torna a conta genuinamente dele, e elimina a única parte estimada |
| Dias por semana | Fixo em 5, declarado na tela | Evita uma sétima pergunta. Cinco é o piso, então a conta sai conservadora |
| Arredondamento | Sempre para baixo | Regra do design guide. E cria o enquadramento mais forte que existe aqui: o número mostrado é o mínimo, a conta real é maior |
| Resultado atrás de formulário | **Não.** Aparece na tela | O posicionamento é número antes de adjetivo. Cobrar pedágio pelo número que ele mesmo calculou contradiz a marca. A captura já aconteceu na etapa 0, então não há nada a proteger |
| Desqualificação | Explícita, quando a conta der menos de 2 horas por semana | O filtro duro do ICP é volume de repetição. Dizer na cara que não justifica hoje é o que compra credibilidade, e protege a hora do Alvaro, que é o gargalo real |
| Armazenamento | **Cloudflare Worker com KV** | Reaproveita padrão que já roda (dois Workers com KV no ar), é grátis, sem dor de CORS, e o repositório já tem o hábito de script mais Worker. Alternativa mais simples, se preferir não mexer em Worker: Apps Script gravando em Google Sheets |
| Notificação | Instantânea, no ato da captura | Armazenar sem avisar é inútil aqui. A régua é responder em menos de um minuto e ligar em até dois. Lead que dorme no KV é lead morto |

**Custo da captura na frente, e como mitigamos.** Pedir telefone antes de entregar valor aumenta abandono na etapa 0. Três mitigações entram no escopo: a etapa 0 mostra **a fórmula** da conta (não um resultado de exemplo, que seria número fabricado), o indicador de progresso mostra as 7 etapas para o compromisso ficar legível, e o motivo do telefone é dito com honestidade, porque o resultado aparece na tela de qualquer forma.

---

## 3. Arquitetura

Sem framework, sem build, coerente com a stack decidida no `PRODUCT.md`.

```
/diagnostico/
  index.html          # as 7 etapas, uma <section> por etapa, uma visível por vez
  quiz.css            # tokens claros do design guide, nada de Tailwind
  quiz.js             # navegação, validação, cálculo, POST, eventos de Pixel
  og.png              # 1200x630, fundo escuro da marca
```

```
workers/quiz-leads/   # no repositório, ao lado dos dois Workers existentes
  index.js            # POST /lead (upsert), GET /leads (protegido por token)
  wrangler.toml       # binding do KV
scripts/ler-leads.js  # dump do KV para CSV, para trabalhar a lista
```

Fluxo: navegador guarda estado em `localStorage` e faz `POST /lead` a cada transição de etapa, sempre com o mesmo `id`, em modo upsert. O Worker grava no KV e dispara a notificação na primeira gravação que já tenha nome e WhatsApp.

---

## 4. As 7 etapas, especificadas

Uma pergunta por tela. Avanço automático ao escolher, nas de escolha única. Botão "voltar" sempre disponível, sem perder resposta.

### Etapa 0, captura

**Título:** Em 6 perguntas eu calculo quantas horas por semana um processo do seu negócio consome hoje.

**Apoio:** A conta é simples e fica à mostra no fim: quantas vezes a tarefa acontece, vezes quanto tempo cada uma leva, vezes 5 dias. O resultado aparece aqui na tela.

**Campos:** `nome` (texto, obrigatório, mínimo 2 caracteres) e `whatsapp` (tel, obrigatório, máscara `(00) 00000-0000`, validação de 10 ou 11 dígitos).

**Motivo do telefone, escrito na tela:** O WhatsApp é para eu te mandar essa conta por escrito e poder responder se você quiser detalhar.

**Consentimento:** uma linha curta acima do botão, com finalidade declarada. **Texto pendente de aprovação do Alvaro** (seção 12), porque é a única parte da página que faz afirmação sobre tratamento de dado, e o acervo proíbe inventar afirmação desse tipo.

**Botão:** Ver minha conta

**Antispam:** campo honeypot escondido e descarte de envio com menos de 3 segundos de permanência.

---

### Etapa 1, segmento

**Pergunta:** Qual desses descreve melhor o seu negócio?

Clínica ou consultório · Escritório de contabilidade ou advocacia · Agência ou consultoria · Comércio ou serviço com agendamento · Outro

*Função: micro-compromisso de custo zero, nenhuma admissão exigida. Devolve o dado que não existe hoje, qual vertical responde anúncio de fato.*

---

### Etapa 2, a tarefa

**Pergunta:** Qual dessas tarefas mais se repete na sua semana?

Responder as mesmas perguntas no WhatsApp · Marcar, confirmar e remarcar horário · Montar orçamento parecido com o anterior · Passar dado de um lugar para outro, planilha, sistema ou papel · Cobrar retorno de quem não respondeu · Outra

*Função: é o coração do diagnóstico, e a lista conscientiza por si só, porque mostra que aquilo é padrão de mercado em vez de falha dele, o que mantém a culpa no método antigo. O que ele marca aqui é o processo que será precificado, e o rótulo escolhido é reusado no texto do resultado.*

---

### Etapa 3, volume

**Pergunta:** Num dia normal, quantas vezes isso acontece?

Slider de 1 a 50, passo 1, valor inicial 10, número visível e editável ao lado. Acima de 50, rótulo "50 ou mais" e cálculo com 50.

*Função: primeiro número da conta, e o filtro duro do ICP.*

---

### Etapa 4, tempo

**Pergunta:** Quanto tempo cada uma leva, do começo ao fim?

Slider de 1 a 30 minutos, passo 1, valor inicial 5, número visível.

**Mecânica obrigatória:** o total calculado aparece e se move ao vivo enquanto ele arrasta. É aqui que a epifania acontece, porque todo mundo subestima o número isolado e a multiplicação faz o trabalho. A conclusão é dele, nós só multiplicamos.

---

### Etapa 5, quem faz

**Pergunta:** Quem resolve isso hoje, na maior parte das vezes?

Eu mesmo · Uma pessoa da equipe · Dividido entre várias · Ninguém com dono claro, cai onde der

*Função: chega tarde de propósito, porque é a emocional. Se a resposta é "eu mesmo", o resultado fala de carga mental do dono em vez de custo, que é o quarto eixo de venda, o mais emocional e o que os concorrentes não usam. "Ninguém com dono claro" é a resposta que prevê mais dor e muda a primeira frase do resultado.*

---

### Etapa 6, o que já tentou

**Pergunta:** Já tentou resolver isso de alguma forma?

Contratei mais gente · Comprei uma ferramenta e não colou · Montei um processo manual que a equipe não seguiu · Nunca tentei de verdade

*Função: a régua de copy diz que o vilão externo sai das histórias de terror, e é exatamente isso que essa pergunta coleta. Cada resposta mapeia um vilão diferente no resultado (seção 6), então o texto final parece escrito para ele. E antecipa a objeção "já tentei", que é mais forte antecipada do que respondida depois.*

---

## 5. O cálculo

```
horas_semana = floor( (volume_dia × minutos × 5) / 60 )
horas_mes    = floor( horas_semana × 4 )
```

Arredondamento sempre para baixo, e a tela diz isso: a conta usa 5 dias e arredonda para baixo, então o número real é maior.

Reais entram só por opção dele, num campo no próprio resultado:

```
custo_mes = horas_mes × valor_hora   // só se valor_hora for preenchido
```

**Saída principal em horas, nunca em reais por padrão.** Duas razões: horas é mais visceral e é a definição de sucesso do `PRODUCT.md`, e afirmação em segunda pessoa sobre dinheiro é exatamente a superfície de Atributos Pessoais da Meta, onde situação financeira é categoria protegida e a fiscalização de 2026 pega implicação indireta. Se ele digita o valor da hora, o número passa a ser dele de ponta a ponta e o risco sai.

### Faixas

| Horas por semana | Faixa | O que o resultado diz |
|---|---|---|
| Menos de 2 | `nao_justifica` | Diz que hoje o volume não justifica projeto, sem rodeio, e oferece acompanhar o conteúdo. Pulso em 3 a 6 meses, porque não agora é diferente de não |
| 2 a 6 | `justifica_um` | Justifica automatizar um processo |
| 6 a 15 | `prioridade` | Justifica e é prioridade sobre o resto |
| Mais de 15 | `meio_turno` | Traduz em pessoa: 40 horas por semana equivale a uma pessoa em tempo integral, então a tradução é feita em valor absoluto, nunca em percentual |

---

## 6. Tela de resultado

Estrutura fixa, quatro blocos, com o texto variando por resposta.

**Bloco 1, o número.** Horas por semana e por mês, em IBM Plex Mono tabular, **tamanho H2 de 32px, peso 500**. Atenção: o guia proíbe nominalmente número em tamanho de display com label pequeno embaixo e stats de apoio, que é o template de métrica de herói. Quem convence é a conta, não o corpo tipográfico. Logo abaixo, em Label de 13px, a conta escrita com as escolhas dele: "12 vezes por dia, 4 minutos cada, 5 dias por semana, arredondado para baixo".

**Bloco 2, o vilão, mapeado pela etapa 6.**

| Resposta | Enquadramento do resultado |
|---|---|
| Contratei mais gente | Mais gente aumenta a capacidade de repetir a tarefa, e a tarefa continua existindo no mesmo tamanho |
| Comprei uma ferramenta e não colou | Ferramenta comprada e não implantada é prateleira. O que faltou foi alguém instalar dentro do processo e acompanhar depois |
| Processo manual que a equipe não seguiu | Processo que depende de disciplina humana degrada na semana cheia. O que não degrada é o que roda sozinho |
| Nunca tentei de verdade | O processo manual não piora com o tempo, ele só repete. A conta de hoje é a mesma do mês que vem |

Culpa sempre no método antigo, nunca nele. Nenhuma frase em segunda pessoa acusatória.

**Bloco 3, a demonstração do mecanismo.** O guia é literal para superfície de conversão: onde o padrão pede prova de terceiro, entra demonstração do mecanismo. Entra aqui a única prova de primeira mão que existe, a auditoria no ambiente do próprio Alvaro, **de 34 para 3 ferramentas, cerca de 1.290 tokens a menos em toda mensagem**, com print de tela real, valor absoluto ao lado de qualquer percentual, e a declaração de que é medição do próprio ambiente e não resultado de cliente.

**Bloco 4, o próximo passo.** Sem preço, sem desconto, sem vaga fabricada.

> Diagnóstico de 30 minutos. Você sai dele com essa conta refeita com os números reais do seu processo e com o que custaria automatizar. Se o volume não justificar, eu digo na hora.
>
> Atendo poucos diagnósticos por semana, porque a implementação é minha.

A escassez aí é verdadeira e documentada, operação de uma pessoa só até a meta de 20 ativos, o que a separa de "10 vagas" inventado.

**Botão:** abre `wa.me` com texto pré-preenchido contendo nome, tarefa escolhida, volume, minutos, horas por semana e a `utm_content` do criativo. A conversa começa com o diagnóstico já escrito, o que elimina o reinício de contexto e permite responder em menos de um minuto.

---

## 7. Persistência

**Payload**, enviado a cada transição de etapa, upsert por `id`:

```json
{
  "id": "uuid gerado no cliente",
  "ts_inicio": "ISO 8601",
  "ts_update": "ISO 8601",
  "nome": "", "whatsapp": "",
  "segmento": "", "tarefa": "",
  "volume_dia": 0, "minutos": 0,
  "quem_faz": "", "ja_tentou": "",
  "horas_semana": 0, "horas_mes": 0,
  "valor_hora": null, "faixa": "",
  "etapa_final": 0, "completou": false, "clicou_whatsapp": false,
  "utm": { "source": "", "medium": "", "campaign": "", "content": "", "term": "" },
  "referrer": "", "user_agent": "", "quiz_versao": "1.0"
}
```

**Chave no KV:** `lead:<ts_inicio>:<id>`, para que `list({prefix:"lead:"})` devolva em ordem cronológica. Índice secundário `fone:<whatsapp>` apontando para o `id`, usado para deduplicar.

**Deduplicação:** mesmo WhatsApp dentro de 24 horas atualiza o registro existente em vez de criar outro.

**Leitura:** `GET /leads?token=...` devolve JSON, e `node scripts/ler-leads.js` gera CSV para trabalhar a lista. O CSV é o CRM mínimo, que o acervo trata como obrigatório.

**Notificação:** no primeiro upsert que já tenha nome e WhatsApp, o Worker dispara aviso instantâneo com nome, telefone e criativo de origem. Segundo aviso apenas quando `completou` virar verdadeiro, com o número da conta. Máximo de dois por lead. Canal a decidir na seção 12, com Telegram como recomendação por ser grátis, instantâneo e sem tarifa por mensagem.

---

## 8. Tracking

Pixel `1175560701016650` já instalado na origem e precisa ser replicado no quiz.

| Momento | Evento | Parâmetros |
|---|---|---|
| Carregou a etapa 0 | `ViewContent` | `content_name: quiz-diagnostico` |
| Enviou nome e WhatsApp | `QuizStart` (custom) | `utm_content` |
| Cada resposta | `QuizStep` (custom) | `step`, e `tarefa` a partir da etapa 2 |
| Chegou no resultado | `Lead` (padrão) | `faixa`, `horas_semana` |
| Clicou no WhatsApp | `Contact` (padrão) | `faixa`, `utm_content` |

**UTM:** lida da URL na entrada, guardada em `localStorage`, enviada em todo payload e colada no texto do `wa.me`. Sem isso o teste de criativo mede clique e nunca descobre qual anúncio virou conversa, que é o laço que o plano de mídia depende de fechar.

**Públicos a criar assim que houver volume:** começou e não terminou, por etapa; terminou e não clicou; terminou e clicou, este último para exclusão e para semente de similar depois. São os ativos de retargeting do degrau de R$45 por dia, e acumulam de graça desde o primeiro dia.

Fase 2, fora do escopo agora: enviar os mesmos eventos por Conversions API a partir do Worker, que já recebe tudo, para sobreviver a bloqueador de anúncio.

---

## 9. Design, contra o brief

O `marca/design-guide.md` manda, e para superfície de conversão ele é explícito.

**Tokens claros, e isso é deliberado:** `--LB #EEF1F6` de fundo, `--LS #FFFFFF` de card, `--LT #0B0E14` de texto, `--LT2 #454C5C` de secundário, `--LL #D8DEE9` de borda, acento `--accent-strong #1D4ED8`. Os três motivos escritos no guia: o comprador abre no celular sob luz do dia, a peça pode virar PDF, e a compra é de previsibilidade, onde o claro carrega menos teatro.

**Tipografia:** Schibsted Grotesk em título e corpo, peso máximo 600. IBM Plex Mono apenas onde há medição de verdade. Inter, Space Grotesk e Space Mono, que a página atual usa, estão as três na lista de faces reprovadas pelo detector e saem.

**Espaçamento:** escala de 4px, só os valores 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Card do quiz com largura máxima de 560px, conteúdo de leitura até 820px.

**Formulário, regras do guia que são condição de entrega:** label sempre visível acima do campo, nunca placeholder fazendo papel de label; erro abaixo do campo que o causou, com `aria-describedby`, nunca só um erro geral no topo; depois do envio, estado de carregando e depois sucesso ou falha, nunca silêncio; alvo de toque mínimo de 44px com 8px de folga; `:focus-visible` com anel de 2px em `--accent-strong` e 2px de deslocamento, e remover o anel está proibido sem exceção.

**Movimento:** um momento autoral só, que aqui é a transição entre etapas. Entrada com `opacity` de 0 a 1 mais `translateY` de 8px, 400ms, `cubic-bezier(.16,1,.3,1)`. O bloco `prefers-reduced-motion` entra copiado inteiro, e o guia diz que peça sem ele não está pronta.

**Proibido, e a página atual viola os quatro:** `spin-beam`, `pulse-glow`, `ticker-marquee` e `float`. Nada de carmim ou rosa (`#e11d48`, `#fb7185`, `rose-*`), nada de cinza puro nem escala neutra do Tailwind, uma cor de acento só, sem eyebrow acima de título, sem selo de desconto.

**Cabeçalho:** Anti Custos. `<html lang="pt-BR">`, favicon de verdade em vez de emoji, Open Graph 1200x630 em fundo escuro, porque ali a peça aparece dentro do feed de outra pessoa.

**Peso:** sai Bootstrap, sai Tailwind por CDN (que compila no navegador), sai Lucide do unpkg com os ícones usados embutidos como SVG, saem as fontes não usadas, sai o `preload` do vídeo de fundo. Alvo: HTML mais CSS mais JS abaixo de 60KB e LCP abaixo de 2s em 4G. O piso de carregamento da régua é 80%, e em mídia paga cada ponto perdido ali é dinheiro que entrou e não viu a tela.

---

## 10. O que muda na página antiga

Ela sai do caminho do tráfego pago e recebe só o que a impede de ser passivo enquanto existir: nome NEXUS AI corrigido no header, no `<title>` e no Open Graph; barra de 40% OFF removida sem substituto; e os números sem fonte ("até 15 horas", "até 20% do seu custo") removidos ou refeitos com fonte, porque hoje são afirmação em segunda pessoa sobre situação financeira, que é gatilho de política na página de destino.

---

## 11. Critérios de aceite

1. As 7 etapas navegam para frente e para trás sem perder resposta, e sobrevivem a recarregar a página.
2. Nome e WhatsApp validam, com erro abaixo do campo e `aria-describedby`.
3. Todo avanço de etapa grava no KV, e abandono na etapa 3 deixa registro com nome, telefone e as duas primeiras respostas.
4. Notificação chega em menos de 30 segundos da captura.
5. O total se move ao vivo no slider da etapa 4.
6. O resultado mostra a conta escrita com as escolhas dele e a declaração de arredondamento para baixo.
7. Conta menor que 2 horas por semana cai no texto de desqualificação.
8. O `wa.me` abre com nome, tarefa, números e `utm_content` no texto.
9. Os cinco eventos de Pixel disparam nos momentos certos, verificados no Events Manager.
10. UTM sobrevive da entrada até o texto do WhatsApp.
11. Zero travessão em qualquer texto da página.
12. Nenhuma das quatro animações banidas, e bloco `prefers-reduced-motion` presente.
13. Nenhuma cor fora dos tokens claros mais o acento, e nenhuma tipografia fora de Schibsted e IBM Plex Mono.
14. Anel de foco visível em todo elemento interativo, e alvo de toque de 44px.
15. Lighthouse mobile acima de 90 em performance, e nada de Bootstrap, Tailwind CDN ou unpkg no fonte.
16. Nenhum número na página sem linha de origem colada.

---

## 12. Decisões pendentes, que travam a construção

1. **Nome do mecanismo.** Proposta: Um Processo Por Vez, tirada do Princípio 2 do produto. Sem nome, as perguntas 1 e 8 da régua de copy ficam sem resposta em toda peça.
2. **Prazo da instalação.** Está em aberto no `PRODUCT.md` e o resultado precisa dizer alguma coisa concreta.
3. **Linha de consentimento de dados.** Só o Alvaro pode escrever, porque é afirmação sobre tratamento de dado e o acervo proíbe inventar quebra desse tipo.
4. **Canal de notificação.** Recomendação: Telegram, grátis e instantâneo. Alternativa: email.
5. **Armazenamento.** Recomendação: Worker com KV, reaproveitando padrão que já roda. Alternativa mais simples: Apps Script com Google Sheets.
6. **Destino do `wa.me`.** Confirmar se continua `wa.link/a6mc4l` ou se passa a ser link direto com texto pré-preenchido, que é o que o quiz precisa.
7. **Aposentar a página antiga em 60 dias**, ou mantê-la indefinidamente para orgânico.

---

## 13. Como saberemos se funcionou

Réguas por etapa, lidas na ordem certa, resultado primeiro para saber se há problema e taxas depois para saber onde.

Na entrada: carregamento acima de 80%. Na etapa 0: taxa de captura, que é a métrica que a decisão de capturar na frente coloca em risco e precisa ser vigiada. Por pergunta: abandono, que diz qual pergunta espanta gente. No fim: taxa de conclusão e taxa de clique no WhatsApp entre quem concluiu. Na conversa: resposta em menos de um minuto e comparecimento ao diagnóstico.

Nenhum desses tem referência própria hoje. Tudo que existe é ordem de grandeza importada, e a primeira medição própria substitui.
