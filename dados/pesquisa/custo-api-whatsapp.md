# Custo de mensagens: API oficial do WhatsApp contra API não oficial de R$ 100/mês

Feito em 03/11/2026. É conta com premissas declaradas, não custo apurado. Ela mede só o custo de **mensagem**: IA (tokens) e servidor existem nos dois caminhos e ficam fora da comparação.

## Tarifas usadas (API oficial, Brasil)

| Categoria | Preço por mensagem entregue | Regra |
|---|---|---|
| Serviço (resposta dentro da janela de 24h aberta pelo cliente) | R$ 0,035 | As primeiras 1.000 do mês, por número, são grátis (desde 01/10/2026) |
| Utility (confirmação, lembrete) | R$ 0,035 | Cobrada inclusive dentro da janela desde 01/10/2026 |
| Marketing (reativação, follow-up comercial fora da janela) | R$ 0,3217 | Sem desconto por volume |
| Conversa que nasce de anúncio "Clique para o WhatsApp" | R$ 0 | Janela gratuita de entrada |

Fontes: regra e datas na [página oficial da Meta](https://developers.facebook.com/docs/whatsapp/pricing). Os valores em reais vêm de fornecedores que publicam a tabela ([Wizebot](https://wizebot.com.br/blog/tabela-precos-whatsapp-business-api-2026), [SocialHub](https://www.socialhub.pro/blog/api-oficial-whatsapp-preco-2026/), [Agilize](https://agilize.app/blog/whatsapp-business-api-oficial-em-2026-precos-por-mensagem-regras-e-como-funciona-a-partir-de-01-10-2026)) e batem com a referência da Meta de US$ 0,0068 por utility. Conferir no rate card oficial em BRL antes de fechar preço.

## Premissas conservadoras (o pior caso razoável)

- Atendimento 24h nos 30 dias do mês.
- **10 mensagens enviadas por conversa**, contando o atendente e a equipe quando a conversa passa para humano. Uma conversa de agendamento real costuma ter de 4 a 6.
- Uma confirmação (utility) por atendimento, em 26 dias úteis.
- Follow-up comercial fora da janela para 20% das conversas, cobrado como marketing.
- **Campanha de reativação para 500 contatos todo mês**, apesar de a oferta prever só uma, no primeiro mês.
- Nenhuma conversa vinda de anúncio, ou seja, sem a janela gratuita.

## Resultado conservador

| Cenário | Conversas novas/dia | Atendimentos/dia | Serviço | Utility | Marketing | **Oficial/mês** | Não oficial | **Diferença** |
|---|---|---|---|---|---|---|---|---|
| A, típico do ICP | 30 | 15 | R$ 280,00 | R$ 13,65 | R$ 218,76 | **R$ 512** | R$ 100 | **+R$ 412** |
| B, volume alto | 60 | 25 | R$ 595,00 | R$ 22,75 | R$ 276,66 | **R$ 894** | R$ 100 | **+R$ 794** |
| C, extremo | 100 | 40 | R$ 1.015,00 | R$ 36,40 | R$ 353,87 | **R$ 1.405** | R$ 100 | **+R$ 1.305** |

Como a conta foi feita (cenário B): 60 x 30 x 10 = 18.000 mensagens de serviço, menos 1.000 grátis, vezes R$ 0,035 = R$ 595. 25 x 26 = 650 confirmações, vezes R$ 0,035 = R$ 22,75. (360 follow-ups + 500 de reativação) x R$ 0,3217 = R$ 276,66.

**Leitura:** no pior caso, a API oficial custa de 5 a 14 vezes a não oficial, e no cenário B ela sozinha passa dos R$ 650 que estimamos para todo o custo de ferramenta. A conta que eu tinha feito antes (cerca de R$ 200) estava otimista: deixava o marketing de fora e supunha 5 mensagens por conversa.

## Resultado com o atendente desenhado para economizar

Três decisões de projeto, sem perder nada que o cliente sinta:
1. **Uma mensagem por turno:** o atendente responde tudo num balão só, em vez de quebrar em três. A média cai para 6 mensagens por conversa, contando a equipe.
2. **Follow-up dentro das 24h**, como serviço (R$ 0,035), em vez de template de marketing (R$ 0,3217).
3. **Reativação só no bônus do primeiro mês**, R$ 160,85 diluídos em 6 meses (R$ 26,81/mês). Uma nova campanha vira serviço cobrado à parte.

| Cenário | Oficial otimizada | Se 30% das conversas vierem de anúncio | Não oficial | Diferença (sem anúncio) |
|---|---|---|---|---|
| A, 30/dia | **R$ 201** | R$ 142 | R$ 100 | +R$ 101 |
| B, 60/dia | **R$ 405** | R$ 288 | R$ 100 | +R$ 305 |
| C, 100/dia | **R$ 679** | R$ 483 | R$ 100 | +R$ 579 |

## Conclusão

1. **A conta financeira é mais apertada do que eu tinha dito.** No cliente de volume alto, a oficial custa de R$ 300 a R$ 800 a mais por mês.
2. **Mesmo assim, a recomendação continua sendo a oficial**, por quatro razões que a conta não captura:
   - O banimento cai sobre o número do cliente, não sobre o nosso. Esse risco não é nosso para assumir em silêncio.
   - Quem banca a perda somos nós: instalação devolvida pela garantia (R$ 3.000) mais o resto do contrato (cerca de R$ 5.000 em 6 meses de contribuição). Com a diferença do cenário B otimizado (R$ 3.660 por ano), a não oficial só compensa se a chance de banimento for menor que uns 45% ao ano. Esse número ninguém sabe. O que se sabe é que disparo em massa por sessão não oficial é o gatilho clássico de banimento.
   - O ICP prioritário (advocacia, odonto, estética) vive de anúncio, e a janela gratuita do anúncio só existe na oficial.
   - A Axônio e os outros vendem "API oficial" como argumento de confiança.
3. **O problema real é a margem no cliente de volume alto, e a solução é preço.** A recomendação é uma **franquia de conversas na mensalidade**: até 1.500 conversas novas por mês (50 por dia) no preço cheio, e acima disso um adicional (por exemplo, R$ 300 por faixa de 1.000 conversas). É assim que Cloudia e Axônio cobram, por atendimento ou por porte.
4. **A estimativa de R$ 650 de custo por cliente** se sustenta no cenário A e no B otimizado, contando IA e servidor. No C, não se sustenta sem franquia.
