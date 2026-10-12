# Diagnóstico de restrição

Resgatado do `briefing-inteligente` do CopyOS quando ele foi descartado (11/10/2026). Serve para duas coisas:
decidir se um problema é de oferta, de mensagem, de medição ou de outra coisa antes de mexer em qualquer peça, e
diagnosticar o negócio de um prospect numa conversa de vendas. As referências às perguntas numeradas da entrevista
original foram trocadas pelo dado que elas pediam.

Um negócio tem uma restrição vinculante por vez: a coisa que limita o crescimento mesmo que todo o resto
melhore. Escolha exatamente uma das nove, pelos sinais e pelos desempates. Só fato conta como evidência; o
autodiagnóstico do dono é hipótese.

## As nove restrições e seus sinais

**1. OFERTA** (o que é vendido não é atraente o bastante para converter atenção fria)
Sinais: diferença honesta frente às alternativas perto de zero e sem prova; existe tráfego mas ninguém compra
(anúncios com cliques e nenhuma venda no histórico); a promessa é uma lista de recursos, não um resultado; preço
copiado de concorrente com margem desconhecida.

**2. MENSAGEM** (a oferta está boa; as palavras e o criativo não a carregam)
Sinais: quem CHEGA converte e elogia, mas o tráfego frio vai embora; o dono não consegue dizer a diferença em uma
frase, embora ela exista; a objeção principal nunca é respondida em lugar público nenhum; o histórico de anúncios
mostra um ângulo só, tentado por pouco tempo.

**3. TRÁFEGO** (genuinamente pouca gente vê, e a máquina que existe converte)
Sinais: evidência real de conversão (recompra, taxa sólida, provas reais), volume minúsculo, nenhum canal pago ou
um que funciona gastando quase nada. É a restrição verdadeira MAIS RARA: só escolha com evidência de conversão
real. "Preciso de mais anúncios", dito pelo dono, é alegação a testar, não diagnóstico.

**4. MEDIÇÃO** (as decisões estão sendo tomadas às cegas)
Sinais: verba paga rodando com CPA desconhecido; números da plataforma contradizem o banco ou o CRM; vereditos de
"anúncio não funciona" sem teste definido, sem piso de amostra ou sem rastreio até a venda. É o padrão quando o
dinheiro se move e ninguém vê para onde.

**5. ECONOMIA** (a conta não financia o crescimento mesmo que tudo funcione)
Sinais: margem baixa com ambição de aquisição paga; CPA conhecido e perto ou acima da margem; produto de preço
baixo sem nada para anexar ou escalonar; desconto como única alavanca.

**6. CANAL PRÓPRIO** (a receita vaza porque a demanda capturada nunca é trabalhada)
Sinais: lista ou base de contatos grande com contato raro ou nenhum; recompra baixa ou desconhecida num serviço de
recorrência; toda a receita vem de primeiro toque pago; nenhum contato pós-venda.

**7. CAPACIDADE** (mais demanda quebraria a entrega)
Sinais: horas de serviço cheias; limites de agenda ou de vagas já vinculantes no volume atual. Verba de crescimento
antes de capacidade é desperdício.

**8. FUNDAÇÃO** (pré-lançamento ou efetivamente pré-lançamento)
Sinais: receita zero ou perto de zero; sem página, sem entrega definida ou sem forma de receber. Tudo é planejado.
A restrição é publicar o primeiro ciclo vendável, não otimizar coisa nenhuma.

**9. FOCO** (estruturalmente bem, operacionalmente disperso)
Sinais: vários negócios ou ofertas ao mesmo tempo, horas de marketing perto de zero em todos, canais começados e
abandonados.

## Regras de desempate (aplique em ordem)

1. FUNDAÇÃO vence tudo quando os sinais dela disparam.
2. CAPACIDADE vence todas as restrições de crescimento: nunca diagnostique tráfego ou mensagem para um negócio que
   não consegue entregar mais.
3. MEDIÇÃO vence TRÁFEGO e MENSAGEM sempre que a verba roda às cegas: não dá para diagnosticar o que não se vê.
4. ECONOMIA vence TRÁFEGO: escalar aquisição com margem negativa cava o buraco mais rápido.
5. OFERTA vence MENSAGEM quando as duas disparam: palavras melhores numa oferta medíocre só viajam mais longe.
6. CANAL PRÓPRIO vence só quando o vazamento é grande e óbvio; senão vira a jogada única dentro de outra restrição.
7. Ainda dividido depois de tudo: MEDIÇÃO, por definição.

## Roteamento neste workspace

| Restrição | Para onde vai |
|---|---|
| OFERTA | `/ofertaos`: comprador, promessa, pacote, garantia e preço sobre os números reais |
| MENSAGEM | `copy-de-conversao` quando a lacuna é palavra ou página; brief de criativo quando é a imagem que não para ninguém. Escolha uma, nunca as duas |
| TRÁFEGO | protocolo do `Wiki/Gerencial/Tráfego Pago - Protocolo e Escala.md`; decidir antes se é criar demanda ou capturar quem já procura |
| MEDIÇÃO | rastreio da UTM até a venda (nomenclatura e UTM no `AGENTS.md`); reconciliação plataforma contra registro real, à mão |
| ECONOMIA | `/ofertaos`, seção de economia: preço, pacote e capacidade sobre margem real |
| CANAL PRÓPRIO | `copy-de-conversao` para sequência de mensagens; operar a ferramenta de disparo fica fora |
| CAPACIDADE | entregar mais (processo, ativo reutilizável) ou subir o preço. Dizer isso com todas as letras |
| FUNDAÇÃO | publicar o primeiro ciclo vendável antes de otimizar; se o que falta é só a copy da página, `copy-de-conversao` |
| FOCO | escolher uma frente por 90 dias. Ferramenta nova para operador disperso não ajuda ninguém |

## Regras rígidas

- Nunca diagnostique só pelo que o dono acha que é o problema; concorde ou redirecione com evidência.
- Nunca escolha TRÁFEGO porque o dono pediu anúncio.
- Quando a resposta honesta é "isto se conserta fora de copy e de oferta", diga. A confiança que vem de um não
  honesto vale mais que uma venda empurrada.
- A jogada única proposta precisa ser realizável nesta semana, de graça, com o que o negócio já tem.
