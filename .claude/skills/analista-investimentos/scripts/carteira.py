"""Diagnostico de carteira: concentracao, risco, correlacao e retorno contra o CDI.

Uso:
  python carteira.py ../modelos/carteira-exemplo.csv
  python carteira.py minha.csv --anos 2

CSV (separador virgula ou ponto e virgula), colunas:
  ticker       codigo do ativo (PETR4, AAPL, ...) OU um nome livre para renda fixa/caixa
  classe       acao | fii | etf | bdr | exterior | cripto | rf | caixa
  quantidade   numero de cotas/acoes (vazio para rf/caixa)
  preco_medio  seu custo medio por unidade (vazio para rf/caixa)
  valor_atual  so para rf/caixa: valor de hoje em R$ (ativo sem cotacao na bolsa)
  custo        so para rf/caixa: quanto voce aplicou, para medir o resultado
  setor        opcional, para ver exposicao setorial
  risco        opcional: baixo | medio | alto (julgamento seu, ver references/filosofias.md).
               Peso por faixa de risco e a tecnica de dimensionamento do Raul Sena.

Ativos em moeda estrangeira entram convertidos so se voce informar o valor em R$ em
valor_atual (a conversao cambial historica nao e modelada aqui: declare isso no relatorio).
"""

import argparse
import csv
import datetime

from _comum import (correlacao, hoje, max_drawdown, pct, brl, retornos, utf8,
                    vol_anual)
from bcb import cdi_acumulado
from precos import historico

COTADAS = {"acao", "fii", "etf", "bdr", "cripto"}


def ler(caminho):
    with open(caminho, newline="", encoding="utf-8-sig") as f:
        amostra = f.read(2048)
        f.seek(0)
        delim = ";" if amostra.count(";") > amostra.count(",") else ","
        linhas = list(csv.DictReader(f, delimiter=delim))
    out = []
    for l in linhas:
        g = lambda k: (l.get(k) or "").strip()
        num = lambda k: float(g(k).replace(",", ".")) if g(k) else None
        out.append({"ticker": g("ticker").upper(), "classe": g("classe").lower() or "acao",
                    "qtd": num("quantidade"), "pm": num("preco_medio"),
                    "valor_atual": num("valor_atual"), "custo": num("custo"),
                    "setor": g("setor") or "n/i", "risco": g("risco").lower()})
    return out


def montar(posicoes, anos):
    series = {}
    for p in posicoes:
        if p["classe"] in COTADAS and p["qtd"]:
            try:
                h = historico(p["ticker"], anos)
                p["valor"] = p["qtd"] * h["ultimo"]
                p["custo_total"] = p["qtd"] * (p["pm"] or h["ultimo"])
                p["ultimo"] = h["ultimo"]
                series[p["ticker"]] = dict(zip(h["datas"], h["precos"]))
                if h["moeda"] and h["moeda"] != "BRL":
                    p["aviso"] = f"cotado em {h['moeda']}: valor tratado como BRL, confira a conversao"
            except Exception as e:
                p["valor"] = p["valor_atual"]
                p["custo_total"] = p["custo"]
                p["aviso"] = f"sem cotacao ({e}); usou valor_atual do CSV"
        else:
            p["valor"] = p["valor_atual"] or 0.0
            p["custo_total"] = p["custo"]
    return series


def serie_carteira(posicoes, series):
    cot = [p for p in posicoes if p["ticker"] in series]
    if not cot:
        return None, {}
    comuns = set.intersection(*[set(series[p["ticker"]]) for p in cot])
    datas = sorted(comuns)
    if len(datas) < 30:
        return None, {}
    rets = {p["ticker"]: retornos([series[p["ticker"]][d] for d in datas]) for p in cot}
    total_cot = sum(p["valor"] for p in cot)
    pesos = {p["ticker"]: p["valor"] / total_cot for p in cot}
    n = len(datas) - 1
    cart = [sum(pesos[t] * rets[t][i] for t in rets) for i in range(n)]
    nivel, acc = [1.0], 1.0
    for r in cart:
        acc *= 1 + r
        nivel.append(acc)
    return {"datas": datas, "rets": cart, "nivel": nivel, "ativos": rets, "pesos": pesos}, rets


def main():
    utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("csv")
    ap.add_argument("--anos", type=float, default=1)
    a = ap.parse_args()

    pos = ler(a.csv)
    series = montar(pos, a.anos)
    total = sum(p["valor"] for p in pos)
    if total <= 0:
        raise SystemExit("carteira sem valor: confira quantidade/valor_atual no CSV")

    print(f"CARTEIRA: {len(pos)} posicoes, valor total {brl(total)} (acesso {hoje().isoformat()})")
    print("Fonte: cotacoes Yahoo Finance; CDI do Banco Central (SGS 12).\n")
    print(f"{'ativo':<22}{'classe':<9}{'valor':>16}{'peso':>8}{'resultado':>11}")
    for p in sorted(pos, key=lambda x: -x["valor"]):
        res = (p["valor"] / p["custo_total"] - 1) if p.get("custo_total") else None
        print(f"{p['ticker'][:21]:<22}{p['classe']:<9}{brl(p['valor']):>16}{pct(p['valor'] / total, 1):>8}{pct(res, 1):>11}")
        if p.get("aviso"):
            print(f"  ! {p['aviso']}")

    pesos = [p["valor"] / total for p in pos]
    hhi = sum(w * w for w in pesos)
    print(f"\nCONCENTRACAO")
    print(f"  maior posicao: {pct(max(pesos), 1)} | 3 maiores: {pct(sum(sorted(pesos)[-3:]), 1)}")
    print(f"  numero efetivo de ativos (1/HHI): {1 / hhi:.1f} de {len(pos)} posicoes")
    for rotulo, chave in (("classe", "classe"), ("setor", "setor")):
        agg = {}
        for p in pos:
            agg[p[chave]] = agg.get(p[chave], 0) + p["valor"]
        txt = ", ".join(f"{k} {pct(v / total, 0)}" for k, v in sorted(agg.items(), key=lambda kv: -kv[1]))
        print(f"  por {rotulo}: {txt}")

    alertas = []
    com_risco = [p for p in pos if p["risco"] in ("baixo", "medio", "alto")]
    if com_risco:
        faixas = {f: sum(p["valor"] for p in com_risco if p["risco"] == f) / total for f in ("baixo", "medio", "alto")}
        print("  por faixa de risco: " + ", ".join(f"{f} {pct(v, 0)}" for f, v in faixas.items()))
        altos = [p for p in com_risco if p["risco"] == "alto"]
        if faixas["alto"] > 0.25:
            alertas.append(f"faixa de risco alto soma {pct(faixas['alto'], 0)} da carteira (referencia do exemplo do Raul: ~23% do total em small caps): ajuste ou justifique")
        for p in altos:
            if p["valor"] / total > 0.05:
                alertas.append(f"{p['ticker']} e de risco alto e pesa {pct(p['valor'] / total, 1)} (referencia: ate 5% por posicao nessa faixa)")
    if len(com_risco) < len(pos):
        print(f"  ({len(pos) - len(com_risco)} posicoes sem faixa de risco informada: preencha a coluna 'risco' para dimensionar por risco)")

    sc, rets = serie_carteira(pos, series)
    risco = [p["valor"] / total for p in pos if p["classe"] not in ("rf", "caixa")]
    if risco and max(risco) > 0.20:
        alertas.append(f"posicao de renda variavel acima de 20% da carteira ({pct(max(risco), 0)}): um evento so decide o resultado")
    setores = {}
    for p in pos:
        if p["classe"] not in ("rf", "caixa") and p["setor"] != "n/i":
            setores[p["setor"]] = setores.get(p["setor"], 0) + p["valor"] / total
    for s, w in setores.items():
        if w > 0.30:
            alertas.append(f"setor {s} soma {pct(w, 0)} da carteira (teto de referencia: 30%): um choque no setor decide o resultado")
    rv = sum(risco)
    if rv > 0.70:
        alertas.append(f"{pct(rv, 0)} da carteira em ativos de risco: sem colchao de renda fixa/caixa para aguentar queda")
    if 1 / hhi < 5 and len(pos) >= 5:
        alertas.append("concentracao real maior que a aparente: poucos ativos mandam no resultado")

    if sc:
        ini, fim = datetime.date.fromisoformat(sc["datas"][0]), datetime.date.fromisoformat(sc["datas"][-1])
        anos_real = (fim - ini).days / 365.25
        ret_p = sc["nivel"][-1] - 1
        vol = vol_anual(sc["rets"])
        mdd = max_drawdown(sc["nivel"])
        cdi = cdi_acumulado(ini, fim)
        cdi_aa = (1 + cdi) ** (1 / anos_real) - 1 if anos_real else None
        ret_aa = (1 + ret_p) ** (1 / anos_real) - 1 if anos_real else None
        sharpe = (ret_aa - cdi_aa) / vol if vol and ret_aa is not None else None
        print(f"\nRISCO E RETORNO DA PARTE COTADA ({sc['datas'][0]} a {sc['datas'][-1]}, pesos de hoje aplicados ao passado)")
        print(f"  retorno: {pct(ret_p)} | CDI no periodo: {pct(cdi)} | excesso sobre o CDI: {pct(ret_p - cdi)}")
        print(f"  volatilidade anual: {pct(vol)} | queda maxima: {pct(mdd)} | Sharpe contra CDI: {sharpe:.2f}" if sharpe is not None else "")
        ts = list(rets)
        pares = []
        for i in range(len(ts)):
            for j in range(i + 1, len(ts)):
                c = correlacao(rets[ts[i]], rets[ts[j]])
                if c is not None:
                    pares.append((c, ts[i], ts[j]))
        if pares:
            media = sum(c for c, _, _ in pares) / len(pares)
            top = max(pares)
            print(f"  correlacao media entre ativos: {media:.2f} | mais parecidos: {top[1]} e {top[2]} ({top[0]:.2f})")
            if media > 0.6:
                alertas.append(f"correlacao media {media:.2f}: diversificacao menor do que o numero de ativos sugere")
        if ret_p < cdi:
            alertas.append("a parte cotada rendeu menos que o CDI no periodo: o risco assumido nao foi pago")
        if mdd < -0.30:
            alertas.append(f"queda maxima de {pct(mdd, 0)}: teste se voce aguenta isso sem vender")
    else:
        print("\nRISCO: poucos dados cotados em comum para calcular volatilidade e correlacao.")

    print("\nALERTAS" if alertas else "\nALERTAS: nenhum disparado pelos limites padrao.")
    for al in alertas:
        print(f"  - {al}")
    print("\nLimites: historico nao e previsao; pesos de hoje aplicados ao passado; cambio nao modelado;")
    print("imposto, come-cotas e custos de corretagem nao entram. Educacional, nao e recomendacao individual.")


if __name__ == "__main__":
    main()
