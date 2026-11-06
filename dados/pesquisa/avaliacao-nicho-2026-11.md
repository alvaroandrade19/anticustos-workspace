# Avaliação do nicho: serviço com horário marcado e atendimento pelo WhatsApp

Feita em 03/11/2026 sobre o ICP v1 (`dados/pesquisa/icp-v1.md`), com pesquisa na web no mesmo dia. Separação usada: **fato** tem fonte, **conta** tem a base à mostra, **hipótese** espera conversa real.

## Veredito

O nicho sustenta com folga a meta de 20 clientes. O risco está na concorrência de preço, não na demanda. O preço de R$ 1.500/mês só se defende onde um lead convertido vale muito dinheiro. Por isso a recomendação é concentrar a prospecção em **advocacia de varejo** e **odontologia e estética de ticket alto**, e tratar as outras áreas da saúde como segunda onda.

| Critério | Nota (1 a 5) | Leitura curta |
|---|---|---|
| Demanda para escala | 5 até 20 clientes, 3 depois disso | Mercado enorme. O que trava a escala é a instalação sob medida, não a falta de cliente |
| Concorrência | 2 | Mercado lotado e com preço de referência baixo (R$ 89 a R$ 1.200/mês, em geral sem implantação nem fidelidade). Pior na saúde, melhor na advocacia |
| Rentabilidade (CAC x LTV) | 4 | A instalação paga a aquisição no ato. Os riscos são o custo de ferramenta não apurado e a cobrança da Meta |
| Público acessível | 4 | Fácil de achar (Maps, Instagram, OAB) e com a vantagem local de Osasco |
| Público engajado | 2 | Engajado no conteúdo do próprio ofício, não em conteúdo de "IA para PME" |

---

## 1. Demanda para escala

**Fatos:**
- Odontologia: 363.546 dentistas inscritos no CFO em fevereiro de 2022 ([Ciência & Saúde Coletiva](https://scielosp.org/pdf/csc/2024.v29n1/e15942022/pt)). Fontes secundárias falam em 400 a 450 mil hoje. A implantodontia tem 22.622 especialistas, e a harmonização orofacial cresceu 50% em um ano ([ABCdoABC](https://abcdoabc.com.br/cirurgioes-dentistas-especialistas-em-estetica-aumentam-50-em-um-ano-no-brasil/)).
- Advocacia: entre 1,3 e 1,5 milhão de inscritos na OAB, 392 mil deles em São Paulo ([Estado de Minas](https://www.em.com.br/direito-e-justica-minas/2026/06/7451542-os-impactos-da-ia-na-advocacia-brasileira.html)).
- Beleza: 236 mil empresas do setor se formalizaram em 2025, perto de 27 por hora ([Agência Sebrae](https://agenciasebrae.com.br/cultura-empreendedora/a-cada-hora-27-negocios-de-beleza-sao-abertos-no-pais-crescimento-foi-de-185-em-2025/)).
- Clínicas: só a capital paulista tinha 33.193 ativas, em dado do Sebrae sem ano claro ([Sebrae PR](https://www.sebraepr.com.br/comunidade/artigo/sebrae-em-dados-clinicas-medicas)).

**Conta:** mesmo que só 1% desses negócios passe no piso de R$ 30 mil e no volume de 30 conversas por dia, sobram dezenas de milhares de empresas no país e alguns milhares na Grande São Paulo. Vinte clientes é uma fração desprezível disso.

**Interpretação:** até 20 clientes, demanda não é problema. Depois disso, o gargalo é a entrega. A instalação de cerca de 20 horas sob medida e as 8 horas por mês de acompanhamento não crescem sem gente. Escala real pede **um modelo pronto por vertical** (o mesmo atendente-base para odonto, com ajustes), o que reduz as horas de instalação e é um argumento a favor de escolher poucas verticais cedo.

Ficou sem número: total de estabelecimentos de Osasco por atividade. O caminho é o Data Sebrae ou o CNAE da Receita, filtrando por município.

## 2. Concorrência

O mercado tem três camadas, todas ativas.

| Camada | Exemplos | Preço público | Ameaça para nós |
|---|---|---|---|
| Ferramenta genérica, o dono configura sozinho | Lua IA PRO ([R$ 89/mês](https://hotmart.com/pt-br/marketplace/produtos/lua-ia-pro-sua-nova-secretaria-inteligente-por-r-89-mes/H101237678T)), Wati (planos de US$ 69 e US$ 149, segundo a [eesel](https://www.eesel.ai/pt/blog/wati-pricing)), ManyChat, SleekFlow, Aurora Inbox | R$ 89 a cerca de R$ 800 | Baixa contra o ICP: o nosso dono não quer configurar nada. Média como âncora de preço ("tem robô de 89 reais") |
| IA embutida no software de gestão da clínica | Nuvem AI do [Clínica nas Nuvens](https://intercom.help/clinicanasnuvens/pt-BR/articles/8417630-o-que-e-o-nuvem-ai), Sofia do [Clina.ai](https://www.capterra.com/p/10049959/clina-ai/), Doctoralia, que [comprou a Feegow](https://startups.com.br/negocios/doctoralia-compra-brasileira-feegow-e-mira-gestao-para-clinicas/), Simples Dental | Módulo do sistema que a clínica já paga | **Alta na saúde.** É a maior ameaça de médio prazo: vira um botão dentro do sistema que o dono já usa |
| Agência ou serviço feito por ele | [Axônio](https://axoniomed.com.br/) (R$ 800, R$ 1.200 ou R$ 2.800/mês, sem implantação nem fidelidade, com acompanhamento e relatório mensal), [Clinia](https://startupi.com.br/clinia-capta-2-milhoes-rodada-pre-seed/) (a partir de R$ 890/mês), [Cloudia](https://cloudia.com.br/) (R$ 449,90 a R$ 1.949,90/mês, mais implantação a partir de R$ 700) e uma oferta grande de freelancers de n8n em sites como o [Workana](https://www.workana.com/pt/job/desenvolvimento-de-automacao-de-atendimento-inteligente-para-clinica-medica) | R$ 450 a R$ 2.800/mês | **Alta e direta na medicina.** A Axônio vende quase o nosso posicionamento ("acompanhamento + relatório") e sai 40% mais barata que o MOTOR em 6 meses, sem prender o cliente. Análise completa em `dados/pesquisa/concorrentes/axonio.md` |

**Interpretação:**
- A promessa "atendente de WhatsApp com IA" virou commodity. O "acompanhamento contínuo" do `PRODUCT.md` também já tem concorrente, então não diferencia sozinho.
- O que ainda diferencia, nesta ordem: (1) garantia de funcionamento com devolução da instalação, que nenhum concorrente encontrado oferece nesses termos; (2) a medição em horas e em reais feita no próprio negócio; (3) presença física em Osasco, impossível para SaaS e para agência remota; (4) foco por vertical, se a escolha da seção 5 for feita.
- Na saúde, os sistemas de gestão vão embutir IA cada vez mais barata. Na **advocacia** não apareceu nenhum concorrente vertical de atendimento nesta busca, o que sugere menos saturação. É uma hipótese que precisa de uma segunda busca focada nesse segmento.

**Risco de plataforma (conferido em 03/11/2026):**
- A proibição de IA de uso geral no WhatsApp não atinge o MOTOR, que é de escopo fechado (confirmado com o Alvaro).
- A cobrança foi confirmada na [tabela oficial da Meta](https://developers.facebook.com/docs/whatsapp/pricing). Desde 01/10/2026, cada número tem 1.000 mensagens de serviço grátis por mês, e a partir da 1.001ª a Meta cobra. O utility dentro da janela de 24h também passou a ser cobrado. A exceção é a conversa que nasce de anúncio "Clique para o WhatsApp", que fica grátis por até 7 dias. A Meta usa US$ 0,0068 por mensagem de utility no Brasil como referência e não publicou na página o valor da mensagem de serviço.
- **Ordem de grandeza (conta, supondo serviço no mesmo preço do utility):** um cliente com 60 conversas por dia e cerca de 5 respostas do atendente por conversa envia perto de 6.600 mensagens por mês. Tirando as 1.000 grátis, são cerca de US$ 38, ou R$ 200 a R$ 220 por mês. Cabe nos R$ 650 estimados, mas come uma fatia.
- O Alvaro cogita API não oficial, com preço fixo por número. A análise do risco está na conversa de 03/11/2026 e precisa de decisão antes do primeiro cliente, porque a ficha da oferta promete "número oficial".

## 3. Rentabilidade: CAC x LTV

Base: instalação de R$ 3.000, mensalidade de R$ 1.500, custo de ferramenta estimado em R$ 650 (não apurado), contribuição de R$ 850 por mês, valores antes de imposto.

**LTV em contribuição, por tempo de permanência:**

| Permanência | Conta | LTV | CAC máximo para LTV:CAC de 3:1 |
|---|---|---|---|
| 6 meses (mínimo do contrato) | 3.000 + 6 x 850 | R$ 8.100 | R$ 2.700 |
| 12 meses | 3.000 + 12 x 850 | R$ 13.200 | R$ 4.400 |
| 18 meses | 3.000 + 18 x 850 | R$ 18.300 | R$ 6.100 |

No fundador, a instalação é de R$ 1.500 e o LTV cai R$ 1.500 em cada linha. O upsell para R$ 2.000/mês acrescenta R$ 500 de contribuição por mês.

**O melhor ponto da economia:** a primeira parcela da instalação (R$ 1.500 na assinatura) e a segunda (na entrada no ar) pagam qualquer CAC de até R$ 3.000 antes da primeira mensalidade. O negócio não precisa financiar aquisição. Para um operador solo sem caixa, isso vale mais que qualquer número de LTV.

**CAC por canal:**
- **Tráfego pago (fato próprio):** R$ 264,57 em três rodadas, zero conversas. Sem dado de CAC, só a prova de que tráfego frio para página não converte com a mensagem atual.
- **Prospecção ativa (hipótese):** CAC em tempo. Supondo 30% de conversa para diagnóstico e 30% de diagnóstico para fechamento, sai 1 cliente a cada 11 conversas, ou cerca de 2 semanas na meta de 5 por semana. São taxas inventadas: as conversas até 20/11 dão as primeiras reais.
- **Parceria com contador (hipótese):** CAC igual à comissão. Uma comissão de até R$ 1.500 (uma mensalidade ou a instalação de fundador) ainda deixa LTV:CAC acima de 5:1 no cenário de 6 meses.

**Valor da hora do Alvaro (conta):** um cliente de 12 meses consome cerca de 20h de instalação mais 96h de acompanhamento e rende R$ 13.200, ou perto de R$ 114 por hora antes de imposto.

**Riscos:** (1) os R$ 650 de custo nunca foram apurados, e a cobrança nova da Meta pode subir esse número; (2) com concorrente a R$ 800 sem fidelidade, a renovação depois do mês 6 depende do relatório mostrar ganho, e só a primeira turma vai dizer qual é o churn real.

## 4. Público acessível e engajado

**Acessível (nota 4):**
- Os negócios aparecem nomeados e com telefone no Google Maps, no Instagram e, na advocacia, no cadastro da OAB. O sinal de necessidade (vaga de recepção, avaliação reclamando de demora, anúncio rodando) é público, que é o que a skill `/prospector` caça.
- Osasco e a Grande São Paulo permitem visita presencial, uma vantagem real contra SaaS e agência remota na hora de fechar fundador.
- Contra: dentista, esteticista e advogado recebem abordagem comercial o tempo todo, então a primeira mensagem precisa trazer o sinal específico daquele negócio para não ser ignorada.

**Engajado (nota 2):**
- O dono é ativo nas redes, mas consome conteúdo do próprio ofício (técnica, paciente, caso, regra do conselho), não conteúdo de gestão ou de IA. O conteúdo atual da Anti Custos, que fala com "PME" em geral, não chega até ele.
- As comunidades onde ele se engaja de verdade são de classe: grupos de WhatsApp de colegas, cursos de especialização, eventos do conselho e da OAB, fornecedores. Para entrar nelas, o caminho é a indicação (contador, colega, fornecedor), mais do que o alcance orgânico.
- Consequência para o conteúdo: ganha força a pauta que fala a língua de uma vertical ("o que a recepção do consultório faz das 19h às 8h"), em vez da pauta genérica.

## 5. Recomendação: onde concentrar

| Segmento | Valor de um lead convertido | Concorrência vertical | Volume de WhatsApp | Prioridade |
|---|---|---|---|---|
| **Advocacia de varejo** (previdenciário, trabalhista) | Alto: honorário de êxito costuma ser de milhares de reais por causa (hipótese) | Baixa nesta busca | Alto quando anuncia | **1** |
| **Odonto e estética de ticket alto** (implante, harmonização) | Alto: tratamento de milhares de reais | Alta (software de gestão com IA) | Alto, muito anúncio | **2** |
| Saúde de consulta (oftalmo, nutrição, psicologia, fisio) | Médio: consulta avulsa ou convênio | Alta | Médio | 3 |
| Veterinária, salão de ticket alto | Baixo a médio | Média | Médio | 4 |

**Por que essa ordem:** a R$ 1.500 por mês contra um concorrente a R$ 800 ou R$ 1.200 sem fidelidade, o argumento de horas devolvidas não basta. O que sustenta o preço é a conta "um lead que não esfriou paga o mês inteiro", que só fecha onde o lead vale milhares de reais. A advocacia junta ticket alto, triagem dolorosa e pouca concorrência vertical. A odontologia tem o mesmo ticket, mas briga com os sistemas de gestão que estão embutindo IA.

**Hipótese a testar nas conversas:** nesses segmentos, a dor que vende pode ser "lead que esfria" mais do que "horas no celular". A copy e o relatório mensal mudam conforme a resposta.

**Próximo passo prático:** até 20/11, dividir as 5 conversas semanais entre advocacia e odonto/estética em Osasco e região, registrar os campos do ICP e comparar a taxa de avanço dos dois grupos.
