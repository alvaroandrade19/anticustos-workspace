# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegado. A escolha foi oferecida ao Alvaro e devolvida ao agente.

Decisão: **HTML e CSS estático**, sem build e sem framework. Motivos: as peças produzidas aqui (carrossel, proposta, slide, landing simples) são renderizadas para PNG via Playwright, que consome HTML direto; o kit já opera assim; e nenhuma superfície atual tem dado dinâmico ou área logada que justifique um framework. Revisitar se surgir um site com muitas páginas e blog, quando Astro passa a ser a troca natural.

## Users

Donos de pequenas e médias empresas de serviço: clínica, escritório de contabilidade, advocacia, agência, consultoria.

O decisor é o próprio dono, que opera dentro do negócio em vez de só administrar. Ele sente o custo operacional na pele, não através de relatório. Avalia a compra no meio do expediente, geralmente pelo celular, sem tempo para material longo e sem repertório técnico para julgar arquitetura de solução. Compra alívio de uma dor que ele consegue nomear.

## Product Purpose

A Anti Custos implementa IA em processos operacionais dessas empresas para reduzir custo e trazer previsibilidade.

Sucesso é o cliente conseguir apontar, em reais ou em horas por semana, o que deixou de gastar depois da implementação. Não é a empresa "usar IA".

## Positioning

Operação assistida contínua. A entrega não termina na implantação: a Anti Custos acompanha o processo implementado, ajusta o que degrada e reporta o ganho mês a mês.

O que torna isso difícil de copiar por frase: quase todo concorrente vende projeto avulso, entrega e sai. Assumir o acompanhamento contínuo é um compromisso operacional, não uma promessa de página de vendas, e obriga quem copia a montar a mesma estrutura de acompanhamento.

## Operating Context

- Alvaro trabalha sozinho e acumula prospecção, produção de conteúdo, proposta, implementação e acompanhamento.
- Aquisição hoje é conteúdo orgânico em Instagram e LinkedIn. Tráfego pago (Meta Ads) está previsto para depois de haver criativo validado organicamente.
- Conversa comercial acontece por WhatsApp Business.
- Ferramentas do dia a dia: Google Drive, Canva, WhatsApp Business, Meta Ads, Instagram, LinkedIn.
- Entregas recorrentes: conteúdo para redes, proposta comercial, apresentação.
- O workspace fica em `ccos-ratos/`, com contexto de negócio em `_contexto/` e o guia visual em `marca/design-guide.md`.

## Capabilities and Constraints

**Modelo comercial confirmado:**

- Instalação: R$ 3.000, cobrança única.
- Recorrência: R$ 1.500 por mês. Cobre manter a solução no ar, atualizar e propor novas melhorias.
- A recorrência iguala a instalação no mês 2 e a ultrapassa a partir do mês 3. O valor do contrato mora na retenção, não na venda.

**O que a instalação compra:** o tempo do Alvaro para desenhar e montar toda a automação e integração de IA do negócio do cliente. É venda de tempo de projeto, não de licença nem de ferramenta.

**Custo de operação:** estimado em cerca de R$ 500 por cliente por mês, sem base apurada ainda. A recorrência foi precificada para cobrir esse custo e lucrar em cima dele. Trabalhos futuros devem tratar esse número como estimativa não verificada e nunca publicá-lo como fato.

**Meta de capacidade:** 20 clientes ativos. Esse é o patamar em que a operação deixa de ser solo e a contratação de equipe entra. A R$ 1.500 por cliente, 20 ativos são R$ 30.000 por mês de receita recorrente bruta e cerca de R$ 20.000 líquidos, descontada a estimativa de R$ 500 de custo por cliente. Isso divide cerca de 8 horas mensais por cliente numa semana de trabalho cheia. Trabalhos futuros devem tratar 20 como meta declarada, não como capacidade já comprovada.

**Outras restrições:**

- Operação de uma pessoa só até a meta ser atingida.
- Nenhum conector ou MCP instalado até agora. Lista do que configurar em `tarefas.md`.
- Sem logo definido.

Decisões explicitamente em aberto, a não serem inventadas por trabalhos futuros:

- Custo real de operação por cliente. A estimativa de R$ 500 nunca foi apurada, e ela é a diferença entre R$ 1.000 e algo bem menor de lucro por cliente.
- Entregáveis nomeados da instalação. Sabe-se que ela compra tempo de projeto, mas não o que o cliente recebe por escrito ao final.
- Quais processos a Anti Custos atende primeiro dentro da PME de serviço.
- Prazo mínimo de contrato, se houver.

## Brand Commitments

- Nome: Anti Custos. Fundador e rosto público: Alvaro de Andrade.
- Voz definida e vinculante em `_contexto/preferencias.md`. Restrição dura: nunca usar travessão, em nenhum texto, incluindo peça visual. Direto sem ser superficial, tese clara, hierarquia em vez de lista neutra, nada que se identifique como texto gerado por IA.
- Restrição visual vinculante já registrada pelo usuário em `marca/design-guide.md`. Esse arquivo é a autoridade visual do projeto e não é reaberto aqui.
- Em proposta e apresentação, sobriedade acima de empolgação.

## Evidence on Hand

Nenhuma prova de cliente. Não há cliente fechado, case, depoimento, resultado de terceiro, logo ou
prova social de qualquer tipo.

**Existe, desde 2026-09-07, uma prova de primeira mão:** a auditoria que o Alvaro fez no próprio
ambiente de trabalho, cortando as ferramentas instaladas no agente de 34 para 3 e medindo cerca de
1.290 tokens a menos em toda mensagem, antes e depois. É medição própria, verificável e sua, e é o
primeiro material concreto que a marca tem para demonstrar o mecanismo em vez de alegá-lo.

Trabalhos futuros podem usar essa medição, sempre nomeando que é medição do próprio ambiente e não
resultado de cliente. Ela não vira "economia de X% para empresas" em hipótese nenhuma.

**Trabalhos futuros não podem fabricar nada disso.** Sem inventar depoimento, percentual de economia, quantidade de clientes atendidos, tempo de mercado ou selo. Quando uma peça precisar de prova, usar demonstração do mecanismo (mostrar o processo funcionando) em vez de resultado de terceiro.

Existe um site anterior do projeto, com a marca "NEXUS AI", em `C:\Users\aandr\OneDrive\Área de Trabalho\ASIMOV DESIGN\ASSETS\index.html`. É referência de origem, não case e não identidade atual.

## Product Principles

1. **Número antes de adjetivo.** Toda afirmação sobre economia precisa de uma conta atrás, mesmo que estimada, e a estimativa é declarada como estimativa.
2. **Um processo por vez.** Escopo estreito e entregue vale mais que transformação ampla prometida. É o que torna o acompanhamento contínuo sustentável para uma operação de uma pessoa.
3. **O acompanhamento é o produto.** A implantação é o começo do contrato, não o fim. Comunicação, proposta e conteúdo devem refletir isso em vez de tratar a entrega como marco final.
4. **Nunca fabricar prova.** Na ausência de case, demonstrar o mecanismo. A credibilidade vem de mostrar como funciona, não de alegar quem já usou.
5. **Falar a língua de quem opera.** O leitor é dono que está no meio do expediente. Sem jargão de IA, sem nome de modelo, sem arquitetura. A dor e o custo são o vocabulário.
