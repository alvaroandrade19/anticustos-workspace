# Filtro Editorial

Roda em **todo bloco de copy** antes de qualquer render. Nota mínima 8 em cada parâmetro.
Um único parâmetro abaixo de 8 reprova o bloco e exige reescrita.

> A mentalidade: você é um jornalista brasileiro escrevendo para o Estadão, não uma IA traduzindo
> texto americano. A pergunta não é "está gramaticalmente correto", é "um repórter da Folha
> escreveria assim". A primeira aceita muito lixo. A segunda rejeita quase tudo que soa robótico.

---

## A regra das duas fontes de número

**Esta é a regra mais importante do arquivo, e ela é específica da Anti Custos.**

O método original exige "número + fonte + ano" em toda afirmação factual. O `PRODUCT.md` registra
que a Anti Custos não tem nenhum case, nenhum cliente e nenhum resultado, e proíbe fabricar prova.
As duas coisas juntas produzem uma regra dura:

Todo número que aparece num carrossel é **exatamente uma** destas duas coisas:

**1. Dado público verificável.** Nome da fonte e ano no próprio slide. Checado com WebSearch antes
de escrever, nunca de memória. Preferir fonte brasileira: IBGE, Sebrae, FGV, CAGED, Datafolha,
associação setorial.

**2. Conta aberta.** Uma estimativa aritmética onde **todas as entradas aparecem no slide** e a
palavra "estimativa" aparece junto. O leitor consegue refazer a conta com os números dele. Sem
entrada escondida, sem "em média as empresas".

Não existe terceira categoria. Número que não se encaixa em nenhuma das duas é **cortado**, não
suavizado, não transformado em "muitas empresas" e não arredondado para parecer seguro.

**Proibido em qualquer circunstância:** depoimento inventado, percentual de economia atribuído a
cliente, quantidade de clientes atendidos, tempo de mercado, logo de cliente, selo, "nossos
clientes", "já ajudamos". A Anti Custos não tem nada disso, e a peça que finge ter destrói a única
coisa que a marca tem hoje, que é credibilidade de argumento.

Quando a peça pedir prova e não houver: **demonstrar o mecanismo** em vez de alegar resultado.
Mostrar o processo funcionando vale mais que um número que não existe.

---

## Os 7 parâmetros

### 1. Gramática

O erro mais frequente é artigo ausente.

- "em período inferior a 1 ano" → "em um período inferior a um ano"
- "é marca genérica" → "é uma marca genérica"
- "geração que cresceu com smartphone" → "uma geração que cresceu com smartphone"

Também verificar concordância verbal e fragmentos sem verbo.
**Penalidade:** artigo ausente limita a nota a 7.

### 2. Fluidez

Ler o bloco em voz alta. Se soou robótico, truncado ou pareceu lista disfarçada de frase, reprovou.
Cada bloco funciona como parágrafo de reportagem, com sujeito, verbo, complemento e conectivo.

Picotado: "Vendas é execução. Performance importa. Resultado define carreira."
Fluido: "Vendas é execução individual, porque performance no cara a cara é o que conta quando o
resultado precisa aparecer, e o melhor vendedor vence no talento aplicado com consistência."

Conectivos: porque, só que, por isso, enquanto, quando, mas, aí, então, mesmo assim, ainda assim.
**Penalidade:** bloco picotado sem conectivo limita a nota a 5.

### 3. AI Slop

**Estruturas binárias, proibidas em absoluto:**
- "Não é X, é Y"
- "Não é sobre X, é sobre Y"
- "X diminui, Y acelera"
- "Menos X. Mais Y."
- "Sem X. Sem Y."
- "Deixa de ser X para ser Y"
- "Antes: X. Agora: Y."

Correção: escrever o contraste em prosa com conector natural, nunca em fórmula.

**Cacoetes proibidos:** "a lógica funciona assim", "a pergunta que fica", "o ponto é", "e isso muda
tudo", "no fim das contas", "ao final do dia", "em um mundo onde", "vivemos em uma era", "cada vez
mais", "de forma X", "simplesmente", "basicamente", "na prática" como abertura, "é claro que".

**Jargão corporativo:** ecossistema, sinergia, disruptivo, stakeholders, mindset, storytelling,
overview, curadoria, alavancagem, potencializar. Trocar pelo equivalente coloquial.
Exceção: jargão que é vocabulário do leitor (encargos, Simples, folha, DRE) pode e deve entrar.

**Anglicismos numéricos:** "10+ anos" → "mais de dez anos". "5x maior" → "cinco vezes maior".

**Penalidade:** uma estrutura binária limita a 6. Um cacoete limita a 5.

### 4. Fatos verificados

Ver a regra das duas fontes acima. Nenhum número, data, valor ou citação sai sem passar por ela.
Não misturar formatos numa tabela: percentual preciso ao lado de "Alta" é inconsistência.
**Penalidade:** dado não verificado limita a 6.

### 5. Estrutura

- Anatomia do arco preservada (ver `design-system.md`)
- Toda promessa do hook cumprida antes do slide de direção
- Os dois últimos blocos fazem virada genuína, não resumo do que veio antes

**O erro mais grave é promessa não cumprida.** Se o hook diz "três decisões", o deck tem três
decisões. Se o hook levanta uma contradição, o mecanismo resolve ela. Corrigir cumprindo a promessa
ou trocando o hook, nunca deixando passar.

### 6. Densidade

Tire artigos, conectivos e adjetivos. O que sobra é substância. Se sobrar vago, reescrever do zero.

Genérico: "Empresas estão adotando novas tecnologias para melhorar resultados."
Denso: "O escritório contratou mais um analista em janeiro e o volume de conferência manual engoliu
a contratação em quatro meses."

Sinal de alerta: qualquer bloco que funcionaria com outro sujeito no lugar.

### 7. Tom editorial

Preferir duas frases curtas com ponto a uma frase longa com vírgula.
Sem formalidade excessiva, sem metalinguagem ("este carrossel explica").

**Segunda pessoa.** O método original proíbe "você" no corpo dos slides, mas os próprios exemplos de
referência dele usam. Resolução adotada aqui:

- **Slide 2 (hook): "você" é permitido e desejado.** O trabalho do hook é reconhecimento, e o leitor
  precisa se ver na frase.
- **Slides de mecanismo, prova e expansão: sem "você".** Tom de reportagem. É o que separa
  diagnóstico de conselho de coach, e é onde a credibilidade se ganha.
- **Ponte do CTA e legenda: "você" liberado.**

---

## Os 5 testes finais

1. **Teste da Folha.** Soaria natural num jornal brasileiro ou parece traduzido do inglês?
2. **Teste da substituição.** Funciona com qualquer outro sujeito? Se sim, está genérico.
3. **Teste da promessa.** Todo claim do hook foi cumprido no deck?
4. **Teste do artigo.** Todo substantivo tem artigo?
5. **Teste binário.** Buscou ativamente por "não é X", "sem X", "menos X", "de forma X"?

---

## Proibições de estrutura

**Abertura de slide:** nunca "hoje vamos falar sobre", "neste carrossel você vai aprender", "antes
de começar", "muitas pessoas perguntam", "todo mundo já ouviu falar". Slide começa no fato, na
tensão ou no dado.

**Fechamento de slide:** nunca "continue no próximo", "swipe para ver mais", "mas tem mais", "não
para por aí". O próximo slide tem que ser inevitável pela tensão narrativa.

**Fechamento de CTA:** nunca "espero que tenha gostado", "se esse conteúdo te ajudou", "obrigado por
acompanhar", "não esqueça de seguir". CTA é diretivo, sem agradecimento.

**Dados vagos:** "estudos mostram", "especialistas dizem", "muitas empresas", "a maioria das
pessoas", "recentemente". Sempre nomear, datar e quantificar.

---

## Travessão

**Proibido em absoluto, em qualquer texto da peça, da legenda e da conversa.**

O método original lista o travessão como recurso permitido. O `_contexto/preferencias.md` proíbe sem
exceção, e o arquivo do projeto vence. Usar vírgula, dois-pontos, parênteses ou frase curta.

Esta é a divergência mais fácil de violar por descuido, porque o travessão aparece nos exemplos da
fonte original. Ao adaptar qualquer exemplo daquele material, reescrever a pontuação.

---

## Checklist rápido antes de entregar

- [ ] Todo número é dado público com fonte, ou conta aberta com a base à mostra
- [ ] Zero travessão
- [ ] Zero estrutura binária
- [ ] Zero cacoete da lista
- [ ] Artigos presentes em todas as frases
- [ ] Conectivo natural em cada bloco
- [ ] "Você" só no hook, na ponte do CTA e na legenda
- [ ] Abertura vai direto ao fato
- [ ] Promessa do hook cumprida
- [ ] Nenhuma prova social, porque não existe nenhuma
