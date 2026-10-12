---
name: checagem-pre-lancamento
description: "Checklist único de PRÉ-LANÇAMENTO antes de qualquer peça entrar no ar: anúncio na Meta/Google, pré-landing/advertorial, PDP, e-mail/SMS, listagem na Amazon, VSL ou landing page. Acione quando o usuário disser 'isso está pronto?', 'preflight', 'podemos publicar/lançar isso?', ou entregar uma peça quase final. Cobre conceito/estratégia, Espinha da Atenção, alegações e provas, idioma do mercado (pt-BR por padrão), rastreamento/UTM/pixel e especificações da plataforma; devolve PRONTO ou a lista de correções, corrigir antes de lançar primeiro. Resposta direta primeiro: aponta o que desperdiçaria verba, seria reprovado ou quebraria a atribuição (especificidade inventada, alegação Vermelha, política do canal, rastreamento quebrado, violação de especificação, campo faltando na Especificação de Conceito), nunca agressividade ou 'ousado demais'; numa provável reprovação, entrega a rota alternativa mais forte. O usuário decide o que é publicado. Respeite `--extreme`/`--unrestricted`/`--lite`."
---
# Checagem Pré-lançamento

Um checklist, rodado logo antes de algo ir ao ar. Ele não escreve a peça: pega o que desperdiçaria verba, seria reprovado ou quebraria a atribuição, e diz isso sem rodeios. É resposta direta em primeiro lugar: uma peça ousada e agressiva é APROVADO; os itens de corrigir antes de lançar são especificidades inventadas, alegações ilegais ou Vermelhas, rastreamento quebrado e violações de especificação, não intensidade. O usuário decide o que é publicado.

## Atenção ao modo (rode primeiro)
Respeite as flags de modo (o contrato está embutido aqui, sem arquivo externo). O padrão é o modo da casa, que neste checklist se comporta como `--extreme` (ousadia nunca é problema), com as regras da casa como item de correção (4b). As flags controlam a INTENSIDADE DA COPY e quanto você reporta; nunca fazem uma especificidade inventada passar por real.
- **`--extreme`:** não aponte agressividade, pressão, enquadramento de inimigo, urgência ou "ousado demais" como problema. Os itens de corrigir antes de lançar são só os da seção A.
- **`--unrestricted`:** além disso, descarte convenções opcionais de estilo, tom e tamanho, e só reporte política da plataforma quando a reprovação for quase certa. Uma especificidade inventada ainda recebe uma flag simples. Confirme que a política que você aponta está em vigor para aquele canal; regras de plataforma mudam.
- **Provável reprovação no canal indicado:** diga `Provável reprovação em <canal>`, cite a regra exata e entregue a ROTA ALTERNATIVA mais forte e com respaldo: um enquadramento diferente que passe pela regra com força total, uma prova diferente que sustente a mesma alegação ou um canal claramente diferente onde a peça possa rodar como está. Nunca suavize em silêncio e nunca devolva uma recusa seca.

Formato nunca é problema aqui: criativo com cara nativa (conversas de chat, cards de jogador, molduras editoriais) é escolha de estilo. Este checklist aponta alegações sem respaldo, faixas Vermelhas, rastreamento quebrado e problemas de especificação ou de política do canal indicado, dentro de qualquer formato.
- **`--lite`:** rode só a seção A.

## O checklist
Rode na ordem. Marque cada item ✅ aprovado / ⚠️ deveria corrigir / 🔧 corrigir antes de lançar.

### A. Corrigir antes de lançar (todos os modos)
1. **Nenhuma especificidade inventada:** nenhuma estatística, percentual, mecanismo, estudo, depoimento, preço, credencial, endosso, garantia ou alegação de estado ao vivo inventados e apresentados como reais, e nenhum `[placeholder]` sem preencher na copy. Todo número/alegação remete ao Banco de Provas ou recebe flag. Veja `**checagem-de-alegacoes**`.
2. **Faixas de alegação e política do canal:** alegações 🔴 da faixa Vermelha, endosso de especialista falso ou implícito, isca de medo diagnóstico (conforme `checagem-de-alegacoes`) ou conflito com a política de anúncios do canal indicado. Alegações Aprovadas pelo Dono precisam ter todas as condições atendidas. Política muda: confirme a regra vigente quando ela importar para um lançamento, ou rotule a checagem como um retrato datado. Numa provável reprovação por política, cite a regra e a rota alternativa mais forte e com respaldo.
3. **Rastreamento intacto:** URL de destino correta; UTMs presentes e consistentes; o evento do pixel/CAPI dispara; a oferta/preço na peça bate com o destino (congruência entre mensagem e página). Confira contra a seção "Tráfego pago" do `AGENTS.md`: nomes de campanha, conjunto e anúncio no padrão, UTM dentro do link de destino e nunca também no campo de parâmetros de URL do Meta, `utm_content` igual ao nome do anúncio em minúsculo. Em teste, os aprimoramentos automáticos de texto do criativo da Meta ficam desligados, senão a Meta reescreve a copy e o teste perde a leitura. Um lançamento com atribuição quebrada é verba desperdiçada.
4. **Especificações válidas:** limites de formato/proporção/duração/caracteres da plataforma respeitados; nenhuma headline cortada; texto na imagem dentro da tolerância; vídeo com legenda, se necessário.
4b. **Regras da casa:** zero travessão (nem o curto); nenhuma construção "não é X, é Y" ou "não é só X, é Y"; nenhuma garantia de faturamento; urgência e escassez só quando verdadeiras; todo número é dado público com fonte ou conta aberta com a base à mostra; assinatura certa por canal (Instagram e anúncio como Anti Custos, LinkedIn em primeira pessoa do Alvaro).

### B. Completude da Especificação de Conceito (🔧 para um teste pago)
5. **Especificação de Conceito (social pago):** contexto de persona/problema, ângulo, oferta/proposta de valor, caminho de prova, formato, estágio/canal, variável de teste, critérios de sucesso + critérios de corte. Um campo faltando é flag de corrigir antes de lançar: sem ele, o teste não pode ser lido com clareza.
6. **Uma variável de teste clara** (se for um teste) e uma janela de leitura definida.
7. **Cadeia de venda completa intacta (quando a peça carrega um argumento de venda completo e o CopyOS está instalado):** existe um bloco ARCHITECTURE rotulado (escrito pelo Motor), a checagem de conformidade estrutural dele deu aprovado e a revisão de ofício rodou nesta versão da copy sem nenhum placeholder em aberto. Use revisor-chefe quando estiver instalada; caso contrário, use o processo de revisão de copy do usuário. Um placeholder de prova sem preencher recebe uma flag específica de corrigir antes de lançar; ele nunca segura o rascunho.

### C. Espinha da Atenção e mensagem (⚠️)
8. **O gancho bate com o nível de consciência:** peças frias e de baixa consciência abrem com um gancho de fato/prova/contraste concreto, não com o produto nem com um benefício vago; peças para quem é consciente do produto, público morno, remarketing e peças puxadas pela oferta podem, com razão, abrir com produto, prova, preço, oferta ou ação (conforme a doutrina da Espinha da Atenção no Motor do CopyOS, quando instalado). Aponte o descompasso em qualquer uma das direções.
9. **Tarefas da espinha cobertas na proporção certa:** Consciência → Atenção → Educação → Desejo → Justificativa → Ação como diagnóstico: uma peça fria completa cumpre as seis tarefas; um componente de tarefa única cumpre a sua; tráfego frio não leva o produto na cara no primeiro segundo.
10. **Encaixe no canal:** o texto sobre a imagem estática / a primeira tela da página de produto / o assunto do e-mail carregam o gancho, não papel de parede.

### D. Idioma e marca (⚠️)
11. **Idioma nativo do mercado** (o padrão é o português do Brasil; vale igual para qualquer outro mercado que a peça mire): escrito de forma nativa na língua comercial do mercado, sem marcas de tradução, sem mistura de registro errada, com acentuação correta.
12. **Voz da marca + unidade de design:** copy e visual apontam para a mesma prova/conflito; a hierarquia faz a mensagem chegar rápido.

### E. Oferta e economia (⚠️ quando relevante)
13. Oferta/preço/garantia congruentes do anúncio → página → checkout; margem/ticket médio (AOV) sensatos para a oferta em execução.

## Formato de saída
```
PRÉ-LANÇAMENTO: PRONTO  |  PRONTO COM CORREÇÕES  |  CORRIGIR PRIMEIRO
Modo: <flags> / responsabilidade pelo lançamento: usuário

🔧 Corrigir antes de lançar:  <#: o quê, onde, a correção>
⚠️ Deveria corrigir:          <#: o quê, a correção>
✅ Aprovado:                  <lista curta>
```
Abra com o veredito. Para cada item, dê a correção específica, não comentário. Se uma alegação precisa de uma prova que você não tem, diga o que a sustentaria e ofereça encontrá-la (rode você mesma a checagem de alegações; não peça ao usuário para chamar nada). O usuário decide o que é publicado.

## Encaminhamento
- `**checagem-de-alegacoes**` para A1–A2 (especificidades inventadas + faixas + política).
- O Motor do CopyOS (quando instalado) para C (Espinha da Atenção) e qualquer reescrita.
- A sua configuração de analytics/rastreamento para A3 (confirme que o pixel dispara e que as UTMs resolvem antes de gastar verba).
- Problema recorrente vira lição de não repetir: proponha o registro em `_contexto/` pelo fluxo de memória do `AGENTS.md`, ou na lista de flagrantes do `revisor-chefe` se for forma de texto.

## Padrão de qualidade
Veredito primeiro, correções específicas, corrigir antes de lançar e deveria corrigir nunca misturados. Nunca transforme "ousado" em problema. Sempre aponte uma especificidade inventada, uma alegação Vermelha ou um rastreamento quebrado, em qualquer modo.

## Contexto deste workspace

O contexto do negócio está em `_contexto/` (empresa, preferências, estratégia, agora) e no `PRODUCT.md`; para cliente,
em `clientes/<nome>/`. É a única fonte da verdade: não crie brief paralelo, `BUSINESS-MEMORY.md` nem pasta de memória
própria, e não pergunte o que esses arquivos já respondem. O pedido atual vem primeiro: faça o trabalho com o que existe
e ponha as lacunas nas flags. Fato durável que surgir vira proposta de atualização em `_contexto/` (prova verificada vai
para a seção de prova do `PRODUCT.md`) pelo fluxo de memória do `AGENTS.md`: mostrar a mudança e pedir confirmação.
As skills do CopyOS (`copy-de-conversao`, `revisor-chefe`, `checagem-de-alegacoes`, `checagem-pre-lancamento`,
`voz-do-cliente`, `biblioteca-dos-mestres`) se carregam entre si pela ferramenta de skills quando o trabalho pede.
