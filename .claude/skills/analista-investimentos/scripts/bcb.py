"""Macro do Brasil direto do Banco Central (SGS). Gratis, sem chave.

Uso:
  python bcb.py macro            # Selic, CDI 12m, IPCA 12m, juro real, cambio
  python bcb.py focus            # expectativas do mercado (Focus) para Selic, IPCA, cambio, PIB
  python bcb.py serie 433 --n 12 # ultimos N pontos de qualquer serie SGS

Fonte: https://api.bcb.gov.br (Sistema Gerenciador de Series Temporais).
"""

import argparse
import datetime
import urllib.parse

from _comum import hoje, http_json, pct, utf8

SGS = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{c}/dados"
SERIES = {
    "selic_meta": 432,  # % a.a., meta definida pelo Copom
    "cdi_diario": 12,  # % a.d.
    "ipca_mensal": 433,  # % no mes
    "igpm_mensal": 189,  # % no mes
    "dolar_venda": 1,  # R$ por US$, PTAX venda
}


def _data(s):
    return datetime.datetime.strptime(s, "%d/%m/%Y").date()


def ultimos(codigo, n):
    return http_json(SGS.format(c=codigo) + f"/ultimos/{n}?formato=json")


def periodo(codigo, ini, fim):
    f = "%d/%m/%Y"
    url = SGS.format(c=codigo) + f"?formato=json&dataInicial={ini.strftime(f)}&dataFinal={fim.strftime(f)}"
    return http_json(url)


CDI_MENSAL = 4391  # % no mes


def cdi_acumulado(ini, fim):
    """CDI acumulado entre duas datas (decimal). Benchmark padrao de renda fixa.

    Ate ~13 meses usa a serie diaria (exata). Acima disso usa a mensal, porque o BC derruba
    consultas longas da diaria; a mensal conta meses cheios, entao a ponta e aproximada.
    """
    acc = 1.0
    if (fim - ini).days <= 400:
        for p in periodo(SERIES["cdi_diario"], ini, fim):
            acc *= 1 + float(p["valor"]) / 100
    else:
        for p in periodo(CDI_MENSAL, ini.replace(day=1), fim):
            acc *= 1 + float(p["valor"]) / 100
    return acc - 1


def acumulado_12m(codigo):
    pts = ultimos(codigo, 12)
    acc = 1.0
    for p in pts:
        acc *= 1 + float(p["valor"]) / 100
    return acc - 1, pts[-1]["data"]


def macro():
    fim = hoje()
    ini = fim - datetime.timedelta(days=365)
    selic = float(ultimos(SERIES["selic_meta"], 1)[0]["valor"]) / 100
    cdi_d = ultimos(SERIES["cdi_diario"], 1)[0]
    cdi_aa = (1 + float(cdi_d["valor"]) / 100) ** 252 - 1
    cdi_12m = cdi_acumulado(ini, fim)
    ipca12, ipca_ref = acumulado_12m(SERIES["ipca_mensal"])
    igpm12, igpm_ref = acumulado_12m(SERIES["igpm_mensal"])
    usd = ultimos(SERIES["dolar_venda"], 1)[0]
    real_ex_post = (1 + cdi_12m) / (1 + ipca12) - 1
    real_ex_ante_proxy = (1 + selic) / (1 + ipca12) - 1
    print(f"Macro Brasil (fonte: Banco Central, SGS, acessado em {fim.isoformat()})")
    print(f"  Selic meta:            {pct(selic)} a.a.")
    print(f"  CDI anualizado (hoje): {pct(cdi_aa)} a.a. (ultimo dia: {cdi_d['data']})")
    print(f"  CDI acumulado 12m:     {pct(cdi_12m)}   <- benchmark da carteira")
    print(f"  IPCA 12m:              {pct(ipca12)} (ate {ipca_ref})")
    print(f"  IGP-M 12m:             {pct(igpm12)} (ate {igpm_ref})")
    print(f"  Juro real ex-post 12m: {pct(real_ex_post)}  (CDI 12m contra IPCA 12m)")
    print(f"  Juro real Selic/IPCA:  {pct(real_ex_ante_proxy)}  (aproximacao, nao e ex-ante de verdade)")
    print(f"  Dolar PTAX venda:      R$ {float(usd['valor']):.4f} ({usd['data']})")
    print("  Leitura: renda variavel precisa pagar acima do CDI para justificar o risco.")


FOCUS = "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais"


def focus():
    """Mediana das expectativas do mercado (Boletim Focus) para os proximos anos."""
    print(f"Expectativas do mercado, mediana do Boletim Focus (fonte: Banco Central, acessado em {hoje().isoformat()})")
    for ind, un in (("Selic", "% a.a. no fim do ano"), ("IPCA", "% no ano"), ("Câmbio", "R$/US$ no fim do ano"),
                    ("PIB Total", "% de crescimento")):
        q = {"$top": "40", "$filter": f"Indicador eq '{ind}' and baseCalculo eq 0", "$orderby": "Data desc",
             "$format": "json", "$select": "Data,DataReferencia,Mediana"}
        url = FOCUS + "?" + urllib.parse.urlencode(q, quote_via=urllib.parse.quote)
        linhas = http_json(url)["value"]
        if not linhas:
            continue
        data = linhas[0]["Data"]
        anos = sorted((l["DataReferencia"], l["Mediana"]) for l in linhas if l["Data"] == data)[:4]
        print(f"  {ind:<10} ({un}, pesquisa de {data}): " + " | ".join(f"{a}: {m:.2f}" for a, m in anos))
    print("  Expectativa de mercado e opiniao agregada de instituicoes, nao fato nem previsao garantida.")


def main():
    utf8()
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("macro")
    sub.add_parser("focus")
    s = sub.add_parser("serie")
    s.add_argument("codigo", type=int)
    s.add_argument("--n", type=int, default=12)
    a = ap.parse_args()
    if a.cmd == "macro":
        macro()
    elif a.cmd == "focus":
        focus()
    else:
        for p in ultimos(a.codigo, a.n):
            print(p["data"], p["valor"])


if __name__ == "__main__":
    main()
