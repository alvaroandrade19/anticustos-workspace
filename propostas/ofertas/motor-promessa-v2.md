# MOTOR Anti Custos: avaliação e reconstrução da promessa (proposta v2)

Feito em 03/11/2026. As 6 decisões foram aprovadas e aplicadas na ficha `ficha-metodo-99.md` em 04/11/2026, com a promessa reescrita depois (a da seção 2.4 foi substituída). Base: ICP v1 (`dados/pesquisa/icp-v1.md`), avaliação do nicho (`dados/pesquisa/avaliacao-nicho-2026-11.md`), concorrente Axônio (`dados/pesquisa/concorrentes/axonio.md`) e custo de API (`dados/pesquisa/custo-api-whatsapp.md`).

---

## Parte 1. Avaliação da promessa atual

> "Seu WhatsApp respondendo clientes e marcando horários sozinho em 14 dias, com um relatório todo mês mostrando quantas horas isso te devolveu."

| Critério | Nota | Diagnóstico |
|---|---|---|
| Resolve um problema específico e gera transformação | 3/5 | O problema é específico (WhatsApp e agenda). A frase descreve o **mecanismo** ("WhatsApp respondendo sozinho"), não a vida do dono depois dele. A transformação prometida, "horas devolvidas", é o ganho mais fraco que o produto gera |
| Benefícios tangíveis e mensuráveis, que viram depoimento | 3/5 | Prazo de 14 dias e relatório mensal são concretos. O que se mede, horas e "metade das conversas de rotina resolvidas", é métrica de operação: o dono não deposita hora no banco nem sente a taxa de resolução. Depoimento bom fala de cliente marcado, falta evitada e dinheiro, e a promessa não mede nada disso |
| Diferenciação diante da concorrência | 2/5 | "24h, marca horário, relatório mensal" é o que Axônio, Cloudia, Clinia e outras dez já dizem, por menos e sem fidelidade. O que temos de único (garantia que devolve a instalação, prazo de 14 dias, presença em Osasco) não aparece na promessa |

**Síntese:** a promessa é honesta e clara, mas vende o *como* e mede o ganho menos valioso. O que o dono do ICP prioritário compra é cliente que não escapa e agenda que não esvazia. Tempo livre vem como consequência.

---

## Parte 2. Reconstrução

### 2.1 Entendimento do ICP (o que muda a promessa)

- **Quem compra primeiro:** advocacia de varejo (previdenciário, trabalhista) e odonto ou estética de ticket alto, em Osasco e na Grande São Paulo. O dono atende pessoalmente e roda anúncio no Instagram.
- **Como o dinheiro escapa:** o lead pergunta preço ou "tenho direito?" às 21h, ou enquanto o dono está com um paciente ou numa audiência, e só recebe resposta horas depois. Cada lead perdido vale milhares de reais (um implante, uma causa previdenciária). Paciente que falta deixa hora vazia que não volta.
- **O desejo:** agenda cheia sem viver no celular, e a certeza de que o dinheiro do anúncio não está vazando no WhatsApp.
- **O medo:** o robô espantar o cliente, falar besteira (sobretudo jurídica ou clínica) e ficar preso a um contrato que não funciona.

**Implicação:** a transformação a prometer vai de "pago anúncio e perco cliente no WhatsApp enquanto trabalho" para "cada pessoa que chama sai com horário marcado, e eu vejo isso em número". Horas devolvidas passam a ser o benefício secundário.

### 2.2 Produto: recursos e o benefício que cada um entrega

| Recurso | Benefício que o dono sente | Como medir (para relatório e depoimento) |
|---|---|---|
| Atendente de IA 24h no número oficial do cliente | Ninguém espera resposta, nem às 22h nem durante o atendimento | Tempo médio da primeira resposta; conversas atendidas fora do horário |
| Agenda automática (marca, confirma, remarca) | O lead vira horário marcado sem ninguém da equipe | **Agendamentos marcados pelo atendente**, separando os de fora do horário |
| Confirmação 24h antes | Menos falta | Taxa de falta antes e depois |
| Passagem para humano com resumo | Nada sensível fica com o robô, e o cliente nunca fica sem resposta | Conversas transferidas e tempo até a equipe responder |
| Mapeamento com conta de partida | O dono vê o próprio vazamento antes de pagar | Linha de base: tempo de resposta, faltas por mês, ticket médio |
| Acompanhamento mensal | O sistema melhora em vez de degradar | Conversas que falharam e foram corrigidas |
| Reativação de clientes parados (bônus) | Dinheiro na primeira semana | Clientes reativados que marcaram |
| Treinamento da equipe | A recepção sabe o que muda no dia seguinte | Não se mede: é condição para o resto funcionar |

**Lacunas a fechar antes de vender:** integração com os sistemas de agenda de odonto (o Simples Dental não tem API, então o caminho é Google Agenda ou agenda própria), o vídeo de demonstração e o modelo de relatório com as métricas da coluna da direita.

### 2.3 Concorrência e como nos diferenciamos

**O que todo mundo oferece** (Axônio, Cloudia, Clinia, Clina.ai, Syntia e outras): atendimento 24h, agendamento, áudio, passagem para humano, relatório ou painel. Preço entre R$ 150 e R$ 1.200/mês, em geral sem implantação e sem fidelidade. Quase todos são **só medicina** e dão um **painel** para o cliente operar.

**Recomendações de diferenciação, da mais forte para a mais fraca:**

1. **Garantia medida em agendamentos, não em taxa de resolução.** No mapeamento, combinamos com o dono uma meta de agendamentos que o atendente marca sozinho, calculada a partir do volume dele. Se no dia 60 a meta não bater, corrigimos em 15 dias. Se ainda não bater, ele sai sem multa e recebe a instalação de volta. É garantia de entrega operacional que o dono entende, sem prometer faturamento. Nenhum concorrente encontrado oferece isso: a Axônio dá 30 dias sem devolução. *Passa pela `checagem-de-alegacoes` antes de publicar.*
2. **Relatório em reais, entregue no WhatsApp do dono, sem painel.** Toda segunda-feira, uma mensagem curta: quantos clientes o atendente marcou, quantos foram fora do horário, quanto isso vale no ticket médio que o próprio dono informou (sempre marcado como estimativa) e quantas faltas a confirmação evitou. O concorrente entrega uma plataforma para o dono logar. Nós entregamos o número onde ele já está. É experiência de uso e é também a fábrica de depoimentos.
3. **Teste do cliente oculto como porta de entrada.** Antes da conversa, mandamos uma mensagem ao WhatsApp do prospect às 21h e medimos quanto tempo a resposta leva. A primeira mensagem da prospecção já traz o dado do negócio dele ("te chamei terça às 21h e a resposta veio 13 horas depois"). Isso vira a linha de base do relatório e a prova do antes. O concorrente começa pela demonstração do produto; nós começamos pelo problema medido no negócio do cliente. Regra: a pergunta do teste é simples e verdadeira (horário de funcionamento, se atende determinado caso), sem marcar consulta falsa nem ocupar horário da agenda, e a abordagem conta que fomos nós.
4. **Atendente que já chega sabendo o ramo.** Modelos prontos por vertical: triagem de elegibilidade para o previdenciário e o trabalhista (sem dar orientação jurídica), avaliação de implante e harmonização para odonto e estética. Para o cliente, a sensação é de "já conhece meu negócio". Para nós, menos horas de instalação, que é o que permite escalar.
5. **Presença em Osasco.** Mapeamento e treinamento presenciais na Grande São Paulo. SaaS e agência de Santa Catarina não conseguem fazer isso.
6. **Número oficial do próprio cliente.** Hoje é o mínimo do mercado, mas responde à objeção do banimento.

**Preço:**
- Manter R$ 3.000 de instalação e R$ 1.500/mês **no ICP prioritário**. Ali, um único lead recuperado (um implante, uma causa) paga meses de serviço, e a conta fica a nosso favor. Na medicina, esse preço perde para a Axônio, o que é mais um motivo para não prospectar lá agora.
- **Reapresentar o prazo de 6 meses**, sem mexer nele: o compromisso real é de 60 dias, porque a garantia é uma porta de saída com devolução no dia 60. Contra o "sem fidelidade" da concorrência, o argumento fica: "você testa 60 dias de verdade e, se não bater a meta, sai com o dinheiro da instalação de volta".
- **Incluir uma franquia de conversas** na mensalidade (até 1.500 conversas novas por mês, com adicional acima disso) para proteger a margem do cliente de volume alto. Ver `dados/pesquisa/custo-api-whatsapp.md`.

### 2.4 A promessa

**Promessa central (a transformação):**

> **Sua agenda enchendo enquanto você trabalha.**

**Promessa completa (o que, em quanto tempo, com que garantia):**

> Quem te chama no WhatsApp recebe resposta na hora e sai com horário marcado, de dia ou às 22h, enquanto você atende quem já está na sua frente. No ar em 14 dias. Toda semana você vê no seu WhatsApp quantos clientes isso marcou. Se no dia 60 a meta combinada não bater, você sai sem multa e recebe a instalação de volta.

**Por que essa:** ela promete o resultado (agenda cheia) e a condição que o dono deseja (sem largar o trabalho). O mecanismo (IA, WhatsApp, automação) fica para a frase de apoio. Cabe na fala de um dono para outro, que é o teste de quem vai indicar.

**Variações por vertical (para prospecção, anúncio e página):**

| Vertical | Promessa |
|---|---|
| Advocacia de varejo | **Quem te procura no WhatsApp chega triado e com consulta marcada, sem você parar de advogar para responder.** |
| Odonto e estética | **A pergunta de preço das 22h vira avaliação marcada, sem você largar o paciente na cadeira.** |
| Saúde de consulta (segunda onda) | **Seu paciente marca, confirma e remarca sozinho pelo WhatsApp, e a sua recepção cuida de quem está na clínica.** |

---

## Decisões para o Alvaro

1. Adotar a promessa central e as variações por vertical.
2. Trocar a métrica da garantia de "metade das conversas de rotina" para "meta de agendamentos combinada no mapeamento".
3. Relatório semanal no WhatsApp do dono, com estimativa em reais, no lugar do relatório só mensal.
4. Teste do cliente oculto como primeiro passo da prospecção.
5. Franquia de 1.500 conversas por mês, com adicional acima disso.
6. API oficial como padrão (ver `dados/pesquisa/custo-api-whatsapp.md`).

Com a aprovação, a ficha `ficha-metodo-99.md` é atualizada pela `/ofertaos`, e a copy das peças passa pelo `copy-de-conversao` e pelo `revisor-chefe`.
