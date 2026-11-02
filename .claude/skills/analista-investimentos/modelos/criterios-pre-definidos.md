# Critérios pré-definidos (preencher ANTES de olhar os ativos)

Vale para qualquer comparação entre empresas. A regra existe para impedir que o gosto escolha os indicadores depois. Fixou, data, assinou: não troca indicador depois de ver o resultado. Se achar que esqueceu um, comece uma comparação nova e diga por quê.

```
Data:
Pergunta que a comparação responde:
Setor (um só; não compare setores diferentes):
Horizonte:

1. Círculo de competência
   Sei explicar em duas frases como essas empresas ganham dinheiro?  [sim / não]
   Se não: parar aqui.

2. Perguntas sobre o setor (Raul Sena; o filtro dos 100 anos foi rejeitado em 02/11/2026)
   Dá lucro consistente para as empresas?                  [sim / não]
   Dependência de regulação do Estado:                     [baixa / média / alta]
   Vendem para empresas (B2B), consumidor (B2C) ou ambos?
   Setor muito alavancado?                                 [sim / não]
   Indicadores próprios do nicho que vou estudar:          (ex: VGV, vendas mesmas lojas, PDD)

3. Vetos (decididos em 02/11/2026, valem para todos; tela vetos_alvaro do triagem.py)
   Empresa estatal:                                        VETO (decisão do Alvaro)
   Prejuízo em 2 ou mais dos últimos 5 exercícios:         VETO (limiar estimado pela skill, revisável)
   Menos de 5 exercícios de balanço disponíveis:           VETO (idem)
   Receita anual abaixo de R$ 1 bi:                        fora da tela de Graham (piso estimado, revisável)
   Dividendo: consequência, nunca critério de entrada.

4. Indicadores da comparação (lista fechada; direção de "melhor")
   [ ] Margem EBIT (maior)          [ ] Margem líquida (maior)
   [ ] ROIC (maior)                 [ ] ROE (maior, olhar com alavancagem)
   [ ] Crescimento de receita (maior)
   [ ] Caixa operacional / lucro (maior, até uns 150%)
   [ ] Dívida líquida / EBITDA (menor)
   [ ] Liquidez corrente (maior)
   [ ] Específicos do setor: ______________________
   Peso de cada indicador, se não forem iguais: ______________________

5. Critério de decisão, escrito antes
   Só avanço para valuation quem: ______________________
   Faixa de risco da posição (baixo / médio / alto) e peso máximo: ______________________

Assinatura e data (fixa a lista): ______________________
```

Depois de preenchido: `python scripts/comparar.py a.json b.json c.json` (cego) e só então `--revelar`.
