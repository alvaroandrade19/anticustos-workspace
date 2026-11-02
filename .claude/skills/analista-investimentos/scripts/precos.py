"""Cotacoes e risco historico de ativos da B3 e do exterior. Gratis, sem chave.

Uso:
  python precos.py PETR4 VALE3 ITUB4 --anos 3
  python precos.py AAPL ^BVSP --anos 5

Ticker da B3 (4 letras + 1 ou 2 digitos) ganha ".SA" sozinho. Indice usa "^" (ex: ^BVSP).
Fonte: Yahoo Finance (endpoint publico de grafico). Nao e dado oficial da B3: serve para
analise, nao para reconciliar com a nota de corretagem. Se falhar, a brapi.dev e a reserva.
"""

import argparse
import datetime
import re

from _comum import (cagr, hoje, http_json, max_drawdown, pct, retornos, utf8,
                    vol_anual)

YAHOO = "https://query1.finance.yahoo.com/v8/finance/chart/{s}?range={r}&interval=1d&events=div"


def simbolo(t):
    t = t.strip().upper()
    if re.fullmatch(r"[A-Z]{4}\d{1,2}", t):
        return t + ".SA"
    return t


def historico(ticker, anos=1):
    """Devolve {'simbolo','moeda','datas':[...],'precos':[...ajustados por dividendo...]}."""
    rng = f"{max(1, round(anos))}y" if anos >= 1 else "6mo"
    j = http_json(YAHOO.format(s=simbolo(ticker), r=rng))
    res = (j.get("chart", {}).get("result") or [None])[0]
    if not res:
        raise ValueError(f"sem dados para {ticker}: {j.get('chart', {}).get('error')}")
    ts = res["timestamp"]
    adj = (res["indicators"].get("adjclose") or [{}])[0].get("adjclose")
    close = res["indicators"]["quote"][0]["close"]
    serie = adj or close
    off = res["meta"].get("gmtoffset", 0)
    datas, precos = [], []
    for t, p in zip(ts, serie):
        if p is None:
            continue
        momento = datetime.datetime.fromtimestamp(t + off, datetime.timezone.utc)
        datas.append(momento.date().isoformat())
        precos.append(float(p))
    return {"simbolo": res["meta"]["symbol"], "moeda": res["meta"].get("currency"),
            "ultimo": float(res["meta"]["regularMarketPrice"]), "datas": datas, "precos": precos,
            "acesso": hoje().isoformat()}


def resumo(h):
    p = h["precos"]
    anos = max((datetime.date.fromisoformat(h["datas"][-1]) -
                datetime.date.fromisoformat(h["datas"][0])).days / 365.25, 1e-9)
    ret = retornos(p)
    return {"retorno": p[-1] / p[0] - 1, "cagr": cagr(p[0], p[-1], anos),
            "vol": vol_anual(ret), "mdd": max_drawdown(p), "anos": anos}


def main():
    utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("tickers", nargs="+")
    ap.add_argument("--anos", type=float, default=1)
    a = ap.parse_args()
    print(f"Fonte: Yahoo Finance, acessado em {hoje().isoformat()}. Preco ajustado por dividendos.")
    print(f"{'ativo':<12}{'ultimo':>10}{'retorno':>10}{'a.a.':>9}{'vol a.a.':>10}{'queda max':>11}")
    for t in a.tickers:
        try:
            h = historico(t, a.anos)
            r = resumo(h)
            print(f"{h['simbolo']:<12}{h['ultimo']:>10.2f}{pct(r['retorno']):>10}{pct(r['cagr']):>9}"
                  f"{pct(r['vol']):>10}{pct(r['mdd']):>11}")
        except Exception as e:
            print(f"{t:<12}ERRO: {e}")


if __name__ == "__main__":
    main()
