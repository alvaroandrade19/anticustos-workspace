"""Utilidades compartilhadas pelos scripts do analista-investimentos.

Python puro (biblioteca padrao). Sem pandas, sem numpy, sem chave de API.
Toda funcao que busca dado externo devolve a fonte e a data de acesso,
porque numero sem fonte nao entra em relatorio.
"""

import datetime
import json
import math
import statistics
import sys
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (anticustos-analista-investimentos)"}
DIAS_UTEIS_ANO = 252


def utf8():
    """Evita erro de acento no console do Windows."""
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def http_json(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def hoje():
    return datetime.date.today()


def pct(x, casas=2):
    if x is None:
        return "n/d"
    return f"{x * 100:.{casas}f}%"


def brl(x):
    if x is None:
        return "n/d"
    s = f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {s}"


def retornos(precos):
    """Retornos simples de uma lista de precos em ordem cronologica."""
    return [precos[i] / precos[i - 1] - 1 for i in range(1, len(precos)) if precos[i - 1]]


def vol_anual(rets):
    if len(rets) < 2:
        return None
    return statistics.stdev(rets) * math.sqrt(DIAS_UTEIS_ANO)


def max_drawdown(precos):
    pico, pior = precos[0], 0.0
    for p in precos:
        pico = max(pico, p)
        pior = min(pior, p / pico - 1)
    return pior


def cagr(inicio, fim, anos):
    if inicio <= 0 or anos <= 0:
        return None
    return (fim / inicio) ** (1 / anos) - 1


def correlacao(a, b):
    n = min(len(a), len(b))
    if n < 20:
        return None
    try:
        return statistics.correlation(a[-n:], b[-n:])
    except statistics.StatisticsError:
        return None


def percentil(valores, p):
    v = sorted(valores)
    k = (len(v) - 1) * p
    f, c = math.floor(k), math.ceil(k)
    return v[int(k)] if f == c else v[f] + (v[c] - v[f]) * (k - f)
