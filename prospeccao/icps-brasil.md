# 30 ICPs Brasil, Anti Custos

Isto é segmentação, não lista de leads. A `/prospector` normalmente entrega negócios reais com prova
de necessidade. Aqui o pedido era outro: mapear os 30 segmentos de PME no Brasil onde o padrão
"volume real de atendimento + equipe pequena + tarefa repetitiva" aparece com mais força, pra
depois escolher qual roda primeiro numa prospecção de verdade.

**Critério de corte**, direto do `reference/qualificacao.md` da própria skill: cada segmento entrou
porque tipicamente reúne dois ou mais destes sinais observáveis publicamente (vaga de
atendente/recepção, reclamação de demora, atendimento só manual, volume alto com equipe curta,
expansão recente) e tem porte compatível com R$ 1.500 por mês de recorrência (não é MEI solo).
Segmento onde a fonte pública normalmente é fraca fica marcado.

Ordenado por proximidade com o que já validamos: `prospeccao/clinicas-sp.csv` já é a prova de
conceito no primeiro cluster.

## Saúde e clínica

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 1 | Clínica odontológica (multi-cadeira) | vaga de recepcionista/atendente, reclamação de demora no Google | agendamento, confirmação, triagem de primeiro contato |
| 2 | Clínica de estética/dermatologia | atendimento só por WhatsApp manual, horário comercial estrito | orçamento, remarcação, fila de espera |
| 3 | Clínica de fisioterapia (multi-profissional) | agenda só por telefone, sem confirmação automática | lembrete de sessão, remarcação, cadastro de paciente |
| 4 | Clínica veterinária | vaga de auxiliar/atendente, reclamação de demora em emergência | triagem, agendamento, retorno de exame |
| 5 | Laboratório de análises clínicas (unidade de coleta) | fila de espera reclamada, atendimento manual de resultado | agendamento de coleta, aviso de resultado pronto |
| 6 | Ótica com laboratório próprio | atendimento de balcão sobrecarregado, prazo de entrega manual | acompanhamento de pedido, lembrete de retirada |

## Serviços profissionais e financeiros

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 7 | Escritório de contabilidade (carteira ampla) | vaga de auxiliar administrativo, prazo fiscal apertado | triagem de documento, resposta a dúvida recorrente de cliente |
| 8 | Escritório de advocacia (área de massa: trabalhista, previdenciário) | vaga de estagiário/atendente, alto volume de novo caso | triagem inicial de caso, agendamento de consulta |
| 9 | Corretora de seguros | atendimento manual de sinistro/renovação | lembrete de renovação, cotação inicial, follow-up |

## Imobiliário e construção

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 10 | Imobiliária (venda e locação) | vaga de corretor/atendente, resposta lenta a lead de anúncio | qualificação de lead, agendamento de visita |
| 11 | Administradora de condomínios | reclamação de demora em chamado, atendimento só em horário comercial | abertura e status de chamado, comunicado a morador |
| 12 | Construtora/incorporadora de pequeno porte | gatilho de lançamento/obra nova, vaga administrativa | atendimento de lead de plantão de vendas |

## Automotivo

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 13 | Oficina mecânica (porte médio, multimarcas) | vaga de recepcionista, reclamação de prazo de orçamento | agendamento, status de serviço, orçamento inicial |
| 14 | Funilaria e pintura | fila de espera reclamada, atendimento só por telefone | agendamento, acompanhamento de reparo |
| 15 | Auto elétrica / centro automotivo | atendimento manual de diagnóstico e orçamento | triagem de problema, agendamento |

## Comércio e distribuição

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 16 | Distribuidora/atacadista regional (alimentos, bebidas, limpeza) | vaga de atendente de pedido, pedido só por telefone/WhatsApp | recebimento e confirmação de pedido, cobrança |
| 17 | Farmácia de manipulação ou rede pequena independente | atendimento manual de receita recorrente | lembrete de reposição, status de manipulado |
| 18 | Pet shop com serviços (banho, tosa, veterinário) | agenda só manual, reclamação de demora | agendamento, lembrete de retorno |
| 19 | Loja de móveis planejados | orçamento e prazo de instalação sem acompanhamento automático | status de pedido, agendamento de medição/instalação |
| 20 | Loja de materiais de construção | atendimento de orçamento em volume, sem triagem | cotação inicial, status de entrega |

## Educação

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 21 | Escola de idiomas | vaga de secretaria/atendente, matrícula manual | qualificação de lead, agendamento de aula experimental |
| 22 | Autoescola | atendimento manual de agenda de aula prática | agendamento, lembrete, status de processo no Detran |
| 23 | Escola/curso técnico profissionalizante | atendimento de matrícula em época de pico | triagem de interesse, matrícula, lembrete de aula |

## Beleza e bem-estar

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 24 | Academia / estúdio de pilates ou crossfit (rede pequena) | atendimento manual de matrícula e renovação | agendamento de aula experimental, cobrança recorrente |
| 25 | Salão de beleza / barbearia (rede de 2+ unidades) | agenda só manual ou por telefone | agendamento, confirmação, lembrete |
| 26 | Clínica de estética capilar / implante capilar | volume de lead de anúncio sem resposta rápida | qualificação de lead, agendamento de avaliação |

## Serviços locais recorrentes

| # | Segmento | Sinal público típico | Tarefa que a automação substitui |
|---|---|---|---|
| 27 | Dedetizadora / controle de pragas | atendimento manual de orçamento urgente | triagem, agendamento, orçamento inicial |
| 28 | Empresa de limpeza e facilities (terceirização) | vaga administrativa, atendimento de contrato manual | triagem de solicitação, escala de equipe |
| 29 | Transportadora / logística de pequeno porte | atendimento manual de cotação de frete | cotação, status de entrega |
| 30 | Empresa de monitoramento/segurança patrimonial | atendimento manual de ocorrência/orçamento | triagem de chamado, orçamento inicial |

## Observação honesta

Segmento com sinal público historicamente mais fraco (menos vaga publicada, menos reclamação
textual): 12, 17, 29. Não elimina o ICP, só significa que a prospecção real ali vai depender mais
de gatilho de expansão e menos de vaga/reclamação.

## Próximo movimento

Escolher 1 a 3 segmentos desta lista e rodar `/prospector` de verdade sobre eles, com região
definida, pra sair com leads nomeados, sinal provado e contato. O cluster de saúde (1 a 6) é onde
já existe prova de conceito (`prospeccao/clinicas-sp.csv`), então é o caminho de menor risco pra
validar oferta antes de abrir os outros clusters.
