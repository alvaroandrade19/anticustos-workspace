---
target: marca/design-guide.md
total_score: 18
max_score: 28
na_heuristics: 7,9,10
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\aandr\\OneDrive\\Documentos\\Projeto Anticustos\\ccos-ratos\\marca\\design-guide.md"
target_fingerprint: "sha256:e431df883d748ecbcdcd94e0e3d63f7d66cc9e58ccbcf77f32476b8fa8a45320"
target_path: "C:\\Users\\aandr\\OneDrive\\Documentos\\Projeto Anticustos\\ccos-ratos\\marca\\design-guide.md"
timestamp: 2026-09-08T04-48-31Z
slug: marca-design-guide-md
---
⚠️ DEGRADED: single-context (subagentes A e B falharam em rate limit 429; ambas as avaliacoes refeitas inline)

## Design Health Score

| # | Heuristica | Nota | Questao |
|---|---|---|---|
| 1 | Visibilidade do status | 3 | Rodape do carrossel resolve; proposta e landing sem estado especificado |
| 2 | Correspondencia com o mundo real | 3 | Guia nao dizia como um numero aparece, e numero e o vocabulario do produto |
| 3 | Controle e liberdade | 2 | prefers-reduced-motion exigido no guia, ausente nos 7 artefatos |
| 4 | Consistencia e padroes | 2 | Guia violava a propria escala de espacamento nos proprios componentes |
| 5 | Prevencao de erro | 1 | Zero spec de formulario, input, foco, erro. Numero de contraste errado |
| 6 | Reconhecer em vez de lembrar | 3 | Nomenclatura de token clara e tabelada |
| 7 | Flexibilidade e eficiencia | n/a | Superficies Persuade, sem usuario recorrente |
| 8 | Estetico e minimalista | 4 | Eixo mais forte do guia |
| 9 | Recuperacao de erro | n/a | Nenhuma superficie interativa especificada (contado na heuristica 5) |
| 10 | Ajuda e documentacao | n/a | Nao se aplica as pecas |
| Total | | 18/28 | Base estetica forte, cobertura funcional incompleta |

## Veredito de especificidade

Guia genuinamente autoral, nao intercambiavel de categoria: escolha de fonte documentada com motivo
de rejeicao, alternativa descartada por escrito, log de decisoes com tres reversoes do proprio autor.

Tensao nao nomeada: "dark premium com respiro Apple" e o figurino da categoria de hype de IA contra
a qual o PRODUCT.md posiciona a marca. A ui-ux-pro-max, em --domain product, devolve para "B2B
Service" o estilo Accessible & Ethical + Minimalism & Swiss, paleta azul profissional mais neutro,
padrao Trust & Authority, com light e dark suportados. Decisao tomada: dark permanece no Instagram,
claro passa a ser a base de proposta e landing.

Detector: proposta.html 0 achados. template.html 20, imposto-de-prateleira 19. Falsos positivos:
gradient-text (desvio ja litigado em 06-09, agora registrado em ignoreRules) e cramped-padding
(padding vive nas classes internas). Achado real: oversized-h1, headline de 104px acima do teto de
96px do proprio guia, e 118 caracteres em corpo de display.

## Pontos fortes

- Tabela de contraste com 11 de 13 razoes corretas na segunda casa decimal
- Regra das duas fontes de numero, que resolve por design a ausencia de prova
- Zero travessao e zero cor proibida em 7 artefatos

## Problemas prioritarios

- [P0] Guia nao especificava apresentacao de numero, sendo "numero antes de adjetivo" o Principio 1
- [P0] Nenhuma superficie de conversao especificada: landing, formulario, foco, erro, impressao, OG
- [P1] Guia violava a propria escala de espacamento nos proprios componentes
- [P1] prefers-reduced-motion exigido e ausente em todos os artefatos
- [P2] Branco sobre --accent declarado como 4,1:1 e "reprova"; real 5,17:1 e passa. A decisao de
  05-09 sobre o botao primario foi tomada sobre premissa falsa
- [P2] Peso 700 usado 22 vezes, fora da regra e fora da excecao

## Bandeiras por persona

- Dona de clinica no celular as 14h: proposta em #05060A sob luz de dia, sem foco visivel, sem alvo
  de toque especificado, sem folha de impressao
- Contador que imprime: guia mandava "renderizar em modo impressao" sem especificar nada
- Alvaro em tres meses via agente: excecao mal delimitada ja produziu um terceiro peso

## Observacoes menores

- #1D2330 e #D8DCE4 em proposta.html fora de qualquer tabela de token
- Referencia de origem aponta para caminho absoluto fora do repositorio
- Logo, foto de perfil e arquivo de marca continuam vazios

## Perguntas

- Se proposta e landing forem claras e so o Instagram escuro, a marca fica incoerente ou mais adulta?
- Qual e a forma autoral de mostrar uma conta que ninguem mais na categoria usa?
- O que na peca denuncia que existe uma pessoa atras dela?
