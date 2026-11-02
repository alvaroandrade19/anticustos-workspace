"""Balancos oficiais de empresas abertas direto da CVM (Dados Abertos). Gratis, sem chave.

Uso:
  python cvm.py buscar weg --ano 2024
  python cvm.py extrair 5410 --anos 2022,2023,2024 --saida ../../../../financas/analises/weg.json

O JSON gerado alimenta o fundamentos.py. Valores convertidos para R$ milhoes, demonstracoes
CONSOLIDADAS, exercicio mais recente de cada arquivo anual (DFP).

Limites que voce precisa conhecer:
  - Plano de contas padrao de empresa NAO financeira. Banco, seguradora e holding financeira
    usam outro plano: o script avisa e nao calcula divida/liquidez.
  - EBITDA nao e padronizado. A depreciacao e somada do fluxo de caixa indireto por nome de
    conta (aproximacao). Capex nao e padronizado: o script entrega o caixa dos investimentos
    (CFI), que inclui compra de ativo financeiro e aquisicao. Confira no ITR/DFP se importar.
  - Numero de acoes nao vem da DFP: informe no fundamentos.py.
Fonte: https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/
"""

import argparse
import csv
import io
import json
import os
import tempfile
import urllib.request
import zipfile

from _comum import UA, hoje, utf8

URL = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_{ano}.zip"
CACHE = os.path.join(tempfile.gettempdir(), "anticustos-cvm")
ESCALA = {"UNIDADE": 1e-6, "MIL": 1e-3, "MILHAO": 1.0}


def baixar(ano):
    os.makedirs(CACHE, exist_ok=True)
    destino = os.path.join(CACHE, f"dfp_{ano}.zip")
    if not os.path.exists(destino):
        req = urllib.request.Request(URL.format(ano=ano), headers=UA)
        with urllib.request.urlopen(req, timeout=180) as r, open(destino, "wb") as f:
            f.write(r.read())
    return destino


def linhas(ano, demo):
    z = zipfile.ZipFile(baixar(ano))
    nome = f"dfp_cia_aberta_{demo}_con_{ano}.csv"
    if nome not in z.namelist():
        return
    with z.open(nome) as f:
        yield from csv.DictReader(io.TextIOWrapper(f, encoding="latin-1"), delimiter=";")


def _ultimo(row):
    return row["ORDEM_EXERC"].upper().startswith(("ÚLTIMO", "?LTIMO", "ULTIMO"))


def buscar(termo, ano):
    achados = {}
    for r in linhas(ano, "DRE"):
        if termo.lower() in r["DENOM_CIA"].lower():
            achados[r["CD_CVM"]] = r["DENOM_CIA"]
    for cd, nome in sorted(achados.items(), key=lambda kv: kv[1]):
        print(f"{cd:>7}  {nome}")
    if not achados:
        print("nenhuma empresa encontrada (o nome e o da razao social, sem ticker)")


def _v(row):
    esc = ESCALA.get(row["ESCALA_MOEDA"].upper().replace("Ã", "A"), 1e-3)
    return float(row["VL_CONTA"].replace(",", ".")) * esc


def _coleta(ano, demo, cd, contas, prefixo_nome=None):
    """Devolve {conta: valor} (ou soma por nome) da ultima versao do exercicio do ano."""
    melhor, out = {}, {}
    for r in linhas(ano, demo):
        if r["CD_CVM"].lstrip("0") != cd.lstrip("0") or not _ultimo(r):
            continue
        melhor[r["VERSAO"]] = melhor.get(r["VERSAO"], []) + [r]
    if not melhor:
        return out
    rows = melhor[max(melhor, key=lambda x: int(x))]
    for r in rows:
        if prefixo_nome:
            c, termos = prefixo_nome
            if r["CD_CONTA"].startswith(c) and any(t in r["DS_CONTA"].lower() for t in termos):
                out["da"] = out.get("da", 0.0) + _v(r)
        if r["CD_CONTA"] in contas:
            out[r["CD_CONTA"]] = _v(r)
    out["_nome"] = rows[0]["DENOM_CIA"]
    return out


def extrair(cd, anos):
    saida = {"fonte": "CVM, Dados Abertos, DFP consolidada", "acesso": hoje().isoformat(),
             "unidade": "R$ milhoes", "anos": {}}
    for ano in anos:
        dre = _coleta(ano, "DRE", cd, {"3.01", "3.02", "3.03", "3.05", "3.06", "3.07", "3.11"})
        if "3.01" not in dre:
            saida["anos"][str(ano)] = {"erro": "sem DRE no plano padrao (empresa financeira ou codigo errado)"}
            continue
        bpa = _coleta(ano, "BPA", cd, {"1", "1.01", "1.01.01", "1.01.02", "1.01.03", "1.01.04"})
        bpp = _coleta(ano, "BPP", cd, {"2.01", "2.01.02", "2.01.04", "2.02.01", "2.03"})
        dfc = _coleta(ano, "DFC_MI", cd, {"6.01", "6.02", "6.03"}, ("6.01.01", ("deprecia", "amortiza")))
        if "6.01" not in dfc:
            dfc = _coleta(ano, "DFC_MD", cd, {"6.01", "6.02", "6.03"})
        g = lambda d, k: d.get(k)
        saida["empresa"] = dre.get("_nome")
        saida["anos"][str(ano)] = {
            "receita": g(dre, "3.01"), "custo": g(dre, "3.02"), "lucro_bruto": g(dre, "3.03"),
            "ebit": g(dre, "3.05"), "resultado_financeiro": g(dre, "3.06"), "lucro_antes_ir": g(dre, "3.07"),
            "lucro_liquido": g(dre, "3.11"),
            "ativo_total": g(bpa, "1"), "ativo_circulante": g(bpa, "1.01"),
            "caixa": (g(bpa, "1.01.01") or 0) + (g(bpa, "1.01.02") or 0),
            "contas_receber": g(bpa, "1.01.03"), "estoques": g(bpa, "1.01.04"),
            "passivo_circulante": g(bpp, "2.01"), "fornecedores": g(bpp, "2.01.02"),
            "divida_cp": g(bpp, "2.01.04"),
            "divida_bruta": (g(bpp, "2.01.04") or 0) + (g(bpp, "2.02.01") or 0),
            "patrimonio_liquido": g(bpp, "2.03"),
            "cfo": g(dfc, "6.01"), "cfi": g(dfc, "6.02"), "cff": g(dfc, "6.03"),
            "depreciacao_aprox": dfc.get("da"),
        }
    return saida


def main():
    utf8()
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("buscar")
    b.add_argument("termo")
    b.add_argument("--ano", type=int, default=hoje().year - 1)
    e = sub.add_parser("extrair")
    e.add_argument("cd_cvm")
    e.add_argument("--anos", required=True, help="ex: 2022,2023,2024")
    e.add_argument("--saida")
    e.add_argument("--preco", type=float, help="grava cotacao no JSON (para comparar.py e triagem)")
    e.add_argument("--acoes", type=float, help="milhoes de acoes, idem")
    a = ap.parse_args()
    if a.cmd == "buscar":
        buscar(a.termo, a.ano)
    else:
        d = extrair(a.cd_cvm, [int(x) for x in a.anos.split(",")])
        if a.preco and a.acoes:
            d["mercado"] = {"preco": a.preco, "acoes": a.acoes, "data": hoje().isoformat()}
        txt = json.dumps(d, indent=2, ensure_ascii=False)
        if a.saida:
            os.makedirs(os.path.dirname(os.path.abspath(a.saida)), exist_ok=True)
            open(a.saida, "w", encoding="utf-8").write(txt)
            print(f"salvo em {a.saida}")
        else:
            print(txt)


if __name__ == "__main__":
    main()
