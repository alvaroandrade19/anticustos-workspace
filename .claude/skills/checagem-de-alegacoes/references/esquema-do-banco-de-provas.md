# Banco de Provas - Esquema e Fluxo de Trabalho

O Banco de Provas é o repositório por projeto de evidências verificadas de onde a Camada Prova-ou-Pergunta puxa. Objetivo: todo gancho/estatística/alegação/prova que afirma um fato vem daqui (qualquer outra coisa é um placeholder nomeado ou uma flag), e toda passada de pesquisa deposita aqui para que o banco se acumule.

## Onde vive
Hoje o banco de provas da Anti Custos é a seção de prova do `PRODUCT.md` (mais o que `_contexto/` registra). Quando houver material suficiente (primeiro cliente, uma rodada de voz do cliente), proponha ao Alvaro criar `_contexto/banco-de-provas.md` a partir de `biblioteca-dos-mestres/references/produto/3-biblioteca-dos-mestres/MODELO-DO-BANCO-DE-PROVAS.md`. Para cliente, o banco fica em `clientes/<nome>/`. Entradas novas entram pelo fluxo de memória do `AGENTS.md`, com aprovação.

## Esquema de entrada
Uma linha por item verificado:

```
| id | alegação/fato | valor/redação | faixa (V/A/AD/R: Verde, Amarelo, Aprovado pelo Dono, Vermelho) | nível de evidência | fonte (arquivo/URL + data) | mercado | usável como | status |
```

- **nível de evidência:** 1 = dado primário / laboratório / especificação / recibo / avaliação real; 2 = fonte secundária respeitável; 3 = inferência (rotule como inferência); nunca nível 0 (presumido) em uso voltado ao cliente.
- **faixa:** de `modelo-semaforo-de-alegacoes.md`.
- **usável como:** gancho / headline / linha de prova / FAQ / sobreposição / assunto de e-mail.
- **status:** verificado (com data) / expirado / precisa de rechecagem. Estatísticas e fatos de estado atual expiram - verifique de novo antes de reutilizar.

## Fluxo de trabalho
1. **Consulte:** antes de escrever, puxe do banco ganchos/provas candidatos para o ângulo.
2. **Lacuna → flag:** se o fato necessário não está lá ou está expirado/inverificável, continue escrevendo: use um placeholder nomeado na linha (`[sua taxa de resposta]`) ou sinalize a alegação, e nomeie o jeito mais barato de obter o fato (pacote de prompts de pesquisa, Reddit/VOC, mineração de avaliações, comprovação de alegação). Nunca fabrique e apresente como real.
3. **Deposite:** quando pesquisa/dissecação/avaliações revelarem um fato verificado ou um gancho vencedor, escreva-o de volta com a fonte e a faixa. É assim que o banco evita que você pergunte duas vezes.
4. **Registro de ganchos vencedores:** mantenha os ganchos comprovados (com o fato verificado por trás + sinal de desempenho) para que peças futuras reutilizem o que funciona.

## Antipadrões
- Tratar a alegação de um concorrente ou uma estatística raspada como fato → precisa ser verificada e sustentada por fonte de forma independente antes de entrar no banco como nível 1–2.
- Arredondar/melhorar um número para soar melhor → isso é fabricação.
- Deixar o banco apodrecer → uma estatística expirada apresentada como atual é um dado inventado; sinalize alto.
