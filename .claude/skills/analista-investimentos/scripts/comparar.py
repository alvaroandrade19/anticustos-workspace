"""Comparacao CEGA de empresas por indicadores definidos de antemao.

Uso:
  python comparar.py weg.json romi.json tupy.json            # nomes escondidos (A, B, C)
  python comparar.py weg.json romi.json tupy.json --revelar  # mostra quem e quem
  python comparar.py a.json b.json --ano 2024 --semente 3

Por que existe: quem prefere uma empresa tende a escolher, depois, os indicadores que a
favorecem ("o ROE e pior, mas e porque ela investe mais"). A defesa e fixar a lista de
indicadores ANTES de olhar os nomes (modelos/criterios-pre-definidos.md) e comparar sem
saber quem e quem. Tecnica de Raul Sena, ver references/filosofias.md.

Entrada: JSONs do cvm.py. Compare so empresas do MESMO setor: setores diferentes tem
margem, alavancagem e giro estruturalmente diferentes e o ranking perde o sentido.
A soma das posicoes NAO e uma nota: serve para ver onde cada empresa e melhor ou pior.
"""

import argparse
import json
import random

from _comum import pct, utf8
from fundamentos import calc

# (rotulo, chave em calc(), maior_e_melhor, formato)
INDICADORES = [
    ("Margem EBIT", "margem_ebit", True, "p"),
    ("Margem liquida", "margem_liquida", True, "p"),
    ("ROIC (aprox.)", "roic", True, "p"),
    ("ROE", "roe", True, "p"),
    ("Cresc. receita", "cresc_receita", True, "p"),
    ("Caixa oper. / lucro", "cfo_sobre_lucro", True, "p"),
    ("DL / EBITDA", "dl_ebitda", False, "x"),
    ("Liquidez corrente", "liquidez_corrente", True, "x"),
    ("EBIT / EV", "ebit_ev", True, "p"),
]
# Magic Formula (Greenblatt): so retorno sobre capital e EBIT/EV. Exige cotacao no JSON.
MAGIC = [i for i in INDICADORES if i[1] in ("roic", "ebit_ev")]


def carregar(caminho, ano):
    d = json.load(open(caminho, encoding="utf-8"))
    anos = sorted(k for k, v in d["anos"].items() if "erro" not in v)
    alvo = str(ano) if ano and str(ano) in anos else anos[-1]
    i = anos.index(alvo)
    mk = d.get("mercado") or {}
    r = calc(d["anos"][alvo], d["anos"][anos[i - 1]] if i else None, mk.get("preco"), mk.get("acoes"))
    return d.get("empresa", caminho), alvo, r


def posicoes(valores, maior_melhor):
    """Posicao 1 = melhor. Empate divide a posicao. None fica fora."""
    ordem = sorted((v for v in valores if v is not None), reverse=maior_melhor)
    out = []
    for v in valores:
        if v is None:
            out.append(None)
        else:
            iguais = [i + 1 for i, o in enumerate(ordem) if o == v]
            out.append(sum(iguais) / len(iguais))
    return out


def fmt(v, tipo):
    if v is None:
        return "n/d"
    return pct(v, 1) if tipo == "p" else f"{v:.2f}x"


def main():
    utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("jsons", nargs="+")
    ap.add_argument("--ano", type=int)
    ap.add_argument("--revelar", action="store_true")
    ap.add_argument("--semente", type=int, default=7)
    ap.add_argument("--magic", action="store_true", help="ranking da Magic Formula: ROIC e EBIT/EV")
    a = ap.parse_args()
    lista = MAGIC if a.magic else INDICADORES
    if len(a.jsons) < 2:
        raise SystemExit("precisa de pelo menos duas empresas")

    dados = [carregar(c, a.ano) for c in a.jsons]
    idx = list(range(len(dados)))
    random.Random(a.semente).shuffle(idx)
    rotulos = {i: chr(65 + k) for k, i in enumerate(idx)}  # A, B, C... embaralhado
    ordem = sorted(idx, key=lambda i: rotulos[i])

    if not a.magic:
        print("Comparacao cega (indicadores fixos, empresas de MESMO setor). Posicao 1 = melhor.\n")
    print(f"{'indicador':<22}" + "".join(f"{'Empresa ' + rotulos[i]:>16}" for i in ordem))
    soma = {i: 0.0 for i in idx}
    n_ind = 0
    if a.magic:
        print("Modo Magic Formula (Greenblatt), cego, posicao 1 = melhor. Ranqueia entre setores por desenho.")
        print("Retorno sobre capital + EBIT/EV. Greenblatt exclui bancos,")
        print("seguradoras e utilities, e so considera EBIT positivo. Cotacao vem do JSON (cvm.py --preco --acoes).\n")
    for rotulo, chave, maior, tipo in lista:
        vals = [dados[i][2].get(chave) for i in ordem]
        pos = posicoes(vals, maior)
        cel = "".join(f"{fmt(v, tipo) + ' (' + (f'{p:g}' if p else '-') + ')':>16}" for v, p in zip(vals, pos))
        print(f"{rotulo:<22}{cel}")
        if all(p is not None for p in pos):
            n_ind += 1
            for i, p in zip(ordem, pos):
                soma[i] += p
    print(f"\nSoma das posicoes em {n_ind} indicadores completos (menor = melhor no conjunto):")
    print("  " + " | ".join(f"Empresa {rotulos[i]}: {soma[i]:g}" for i in ordem))
    print("\nLeia a tabela, nao so a soma: uma empresa pode vencer na soma e perder no unico indicador que importa.")
    print("Razao com denominador minusculo (lucro perto de zero, patrimonio pequeno) explode e distorce a posicao:")
    print("valor muito fora da curva, como caixa/lucro de 1000% ou ROE de 60%, pede conferir os valores absolutos.")
    print("Indicador que alguem quer trocar depois de ver o resultado e sinal de apego, nao de analise.")
    if a.revelar:
        print("\nREVELACAO: " + " | ".join(f"Empresa {rotulos[i]} = {dados[i][0]} ({dados[i][1]})" for i in ordem))
    else:
        print(f"\n(Para revelar os nomes: repita o comando com --revelar. Semente {a.semente} mantem o mesmo sorteio.)")


if __name__ == "__main__":
    main()
