"""Indicadores fundamentalistas e sinais de alerta a partir do JSON do cvm.py (ou feito a mao).

Uso:
  python fundamentos.py weg.json
  python fundamentos.py weg.json --preco 45 --acoes 4200 --selic 0.1375 --ipca 0.0458

Entrada: {"empresa": "...", "anos": {"2023": {...}, "2024": {...}}} nos campos do cvm.py.
Campos faltando viram "n/d", nunca zero. Preco e acoes (em milhoes) ativam os multiplos.

Os limiares abaixo sao ponto de partida e NAO substituem comparacao com pares do mesmo setor.
Banco, seguradora e FII exigem outros indicadores (ver references/fundamentos-e-qualidade.md).
"""

import argparse
import json

from _comum import pct, utf8

ALIQ = 0.34  # IRPJ + CSLL nominal, para NOPAT. Empresa com beneficio fiscal foge disso.


def div(a, b):
    return None if a is None or b in (None, 0) else a / b


def f2(x, suf=""):
    return "n/d" if x is None else f"{x:,.2f}{suf}"


def calc(d, ant, preco, acoes):
    r = {}
    rec, ebit, ll = d.get("receita"), d.get("ebit"), d.get("lucro_liquido")
    pl, divb, caixa = d.get("patrimonio_liquido"), d.get("divida_bruta"), d.get("caixa")
    r["margem_bruta"] = div(d.get("lucro_bruto"), rec)
    r["margem_ebit"] = div(ebit, rec)
    r["margem_liquida"] = div(ll, rec)
    pl_med = (pl + ant["patrimonio_liquido"]) / 2 if ant and ant.get("patrimonio_liquido") and pl else pl
    r["roe"] = div(ll, pl_med)
    dl = None if divb is None or caixa is None else divb - caixa
    r["divida_liquida"] = dl
    cap = None if None in (divb, pl, caixa) else divb + pl - caixa
    r["roic"] = div(ebit * (1 - ALIQ), cap) if ebit is not None else None
    ebitda = ebit + d["depreciacao_aprox"] if ebit is not None and d.get("depreciacao_aprox") else None
    r["ebitda_aprox"] = ebitda
    r["dl_ebitda"] = div(dl, ebitda)
    rf = d.get("resultado_financeiro")
    r["cobertura_juros"] = div(ebit, -rf) if rf is not None and rf < 0 else None
    r["liquidez_corrente"] = div(d.get("ativo_circulante"), d.get("passivo_circulante"))
    r["cfo_sobre_lucro"] = div(d.get("cfo"), ll) if ll and ll > 0 else None
    cfo, cfi = d.get("cfo"), d.get("cfi")
    r["fluxo_pos_invest"] = cfo + cfi if cfo is not None and cfi is not None else None
    r["accruals"] = div(ll - cfo, d.get("ativo_total")) if ll is not None and cfo is not None else None
    r["dso"] = div(d.get("contas_receber"), rec) * 365 if div(d.get("contas_receber"), rec) is not None else None
    custo = abs(d["custo"]) if d.get("custo") else None
    r["liquidez_seca"] = div(d["ativo_circulante"] - d["estoques"], d.get("passivo_circulante")) \
        if d.get("ativo_circulante") is not None and d.get("estoques") is not None else None
    r["pme"] = div(d.get("estoques"), custo) * 365 if div(d.get("estoques"), custo) is not None else None
    r["pmp"] = div(d.get("fornecedores"), custo) * 365 if div(d.get("fornecedores"), custo) is not None else None
    r["ciclo_financeiro"] = r["dso"] + r["pme"] - r["pmp"] \
        if None not in (r["dso"], r["pme"], r["pmp"]) else None
    r["divida_cp_total"] = div(d.get("divida_cp"), divb) if d.get("divida_cp") is not None else None
    r["giro_ativo"] = div(rec, d.get("ativo_total"))
    r["alavancagem_pl"] = div(d.get("ativo_total"), pl)
    if ant:
        r["cresc_receita"] = div(rec - ant["receita"], ant["receita"]) if rec and ant.get("receita") else None
        r["cresc_lucro"] = div(ll - ant["lucro_liquido"], abs(ant["lucro_liquido"])) if ll is not None and ant.get("lucro_liquido") else None
        r["dso_ant"] = div(ant.get("contas_receber"), ant.get("receita")) * 365 if div(ant.get("contas_receber"), ant.get("receita")) else None
    if preco and acoes:
        mc = preco * acoes
        r["valor_mercado"] = mc
        r["pl_mult"] = div(mc, ll) if ll and ll > 0 else None
        r["pvp"] = div(mc, pl)
        ev = mc + dl if dl is not None else None
        r["ev"] = ev
        r["ev_ebit"] = div(ev, ebit) if ebit and ebit > 0 else None
        r["ev_ebitda"] = div(ev, ebitda)
        r["ebit_ev"] = div(ebit, ev) if ev and ev > 0 else None  # earnings yield da Magic Formula
        r["earnings_yield"] = div(ll, mc) if ll else None
        r["fcf_yield"] = div(r["fluxo_pos_invest"], mc)
    return r


def alertas(anos, r_all, selic, ipca):
    out = []
    ult = anos[-1]
    r = r_all[ult]
    if r.get("cfo_sobre_lucro") is not None and r["cfo_sobre_lucro"] < 0.8:
        out.append(f"{ult}: caixa operacional e {r['cfo_sobre_lucro']:.0%} do lucro (abaixo de 80%): lucro de baixa qualidade ou capital de giro absorvendo caixa")
    if r.get("accruals") is not None and r["accruals"] > 0.10:
        out.append(f"{ult}: accruals de {pct(r['accruals'], 0)} do ativo: lucro contabil bem acima do caixa")
    if r.get("dso") and r.get("dso_ant") and r["dso"] > r["dso_ant"] * 1.15:
        out.append(f"{ult}: prazo medio de recebimento subiu de {r['dso_ant']:.0f} para {r['dso']:.0f} dias: receita crescendo mais rapido que o caixa")
    if r.get("dl_ebitda") is not None and r["dl_ebitda"] > 3:
        out.append(f"{ult}: divida liquida / EBITDA de {r['dl_ebitda']:.1f}x (acima de 3x): endividamento pesado, vire para o cronograma de vencimento")
    if r.get("cobertura_juros") is not None and r["cobertura_juros"] < 3:
        out.append(f"{ult}: EBIT cobre so {r['cobertura_juros']:.1f}x das despesas financeiras: pouca folga")
    if r.get("divida_cp_total") is not None and r["divida_cp_total"] > 0.5 and (r.get("divida_liquida") or 0) > 0:
        out.append(f"{ult}: {pct(r['divida_cp_total'], 0)} da divida vence em ate 12 meses: dependencia de rolagem (peso do curto prazo na divida total foi significativo na literatura brasileira)")
    if r.get("liquidez_corrente") is not None and r["liquidez_corrente"] < 1:
        out.append(f"{ult}: liquidez corrente {r['liquidez_corrente']:.2f} abaixo de 1: veja como a empresa rola a divida de curto prazo")
    if r.get("roic") is not None and selic is not None and r["roic"] < selic:
        out.append(f"{ult}: ROIC de {pct(r['roic'], 1)} menor que a Selic ({pct(selic, 1)}): o negocio rende menos que a renda fixa sem risco")
    if r.get("cresc_receita") is not None and r.get("cresc_lucro") is not None and ipca is not None:
        if r["cresc_receita"] < ipca:
            out.append(f"{ult}: receita cresceu {pct(r['cresc_receita'], 1)}, abaixo do IPCA ({pct(ipca, 1)}): encolhimento em termos reais")
    ll = [r_all[a].get("margem_liquida") for a in anos]
    if len([x for x in ll if x is not None]) >= 3 and all(ll[i] is not None and ll[i + 1] is not None and ll[i + 1] < ll[i] for i in range(len(ll) - 1)):
        out.append("margem liquida caiu todos os anos da serie: investigue preco, custo e mix")
    if r.get("earnings_yield") is not None and selic is not None and r["earnings_yield"] < selic:
        out.append(f"retorno do lucro sobre o preco (earnings yield) de {pct(r['earnings_yield'], 1)} abaixo da Selic: o preco ja embute crescimento para compensar")
    return out


def main():
    utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("json")
    ap.add_argument("--preco", type=float)
    ap.add_argument("--acoes", type=float, help="numero de acoes em milhoes")
    ap.add_argument("--selic", type=float)
    ap.add_argument("--ipca", type=float)
    a = ap.parse_args()
    dados = json.load(open(a.json, encoding="utf-8"))
    anos = sorted(k for k, v in dados["anos"].items() if "erro" not in v)
    if not anos:
        raise SystemExit("nenhum ano utilizavel no arquivo (empresa financeira ou codigo errado)")
    print(f"{dados.get('empresa', '?')} | {dados.get('unidade', '')} | fonte: {dados.get('fonte', 'manual')} (acesso {dados.get('acesso', 'n/d')})\n")
    res = {}
    for i, ano in enumerate(anos):
        res[ano] = calc(dados["anos"][ano], dados["anos"][anos[i - 1]] if i else None,
                        a.preco if ano == anos[-1] else None, a.acoes)
    linhas = [("Receita", lambda ano: dados["anos"][ano].get("receita"), "n"),
              ("Cresc. receita", lambda ano: res[ano].get("cresc_receita"), "p"),
              ("Margem bruta", lambda ano: res[ano]["margem_bruta"], "p"),
              ("Margem EBIT", lambda ano: res[ano]["margem_ebit"], "p"),
              ("Margem liquida", lambda ano: res[ano]["margem_liquida"], "p"),
              ("Lucro liquido", lambda ano: dados["anos"][ano].get("lucro_liquido"), "n"),
              ("ROE", lambda ano: res[ano]["roe"], "p"),
              ("ROIC (aprox.)", lambda ano: res[ano]["roic"], "p"),
              ("Divida liquida", lambda ano: res[ano]["divida_liquida"], "n"),
              ("DL / EBITDA aprox.", lambda ano: res[ano]["dl_ebitda"], "x"),
              ("EBIT / desp. financ.", lambda ano: res[ano]["cobertura_juros"], "x"),
              ("Divida CP / divida", lambda ano: res[ano]["divida_cp_total"], "p"),
              ("Liquidez corrente", lambda ano: res[ano]["liquidez_corrente"], "x"),
              ("Caixa oper. / lucro", lambda ano: res[ano]["cfo_sobre_lucro"], "p"),
              ("CFO + CFI", lambda ano: res[ano]["fluxo_pos_invest"], "n"),
              ("Accruals / ativo", lambda ano: res[ano]["accruals"], "p"),
              ("Liquidez seca", lambda ano: res[ano]["liquidez_seca"], "x"),
              ("Prazo receb. (dias)", lambda ano: res[ano]["dso"], "n"),
              ("Prazo estoque (dias)", lambda ano: res[ano]["pme"], "n"),
              ("Prazo fornec. (dias)", lambda ano: res[ano]["pmp"], "n"),
              ("Ciclo financeiro (d)", lambda ano: res[ano]["ciclo_financeiro"], "n")]
    print(f"{'':<22}" + "".join(f"{ano:>14}" for ano in anos))
    for nome, fn, tipo in linhas:
        cel = []
        for ano in anos:
            v = fn(ano)
            cel.append(f"{pct(v, 1):>14}" if tipo == "p" else f"{f2(v, 'x' if tipo == 'x' else ''):>14}")
        print(f"{nome:<22}" + "".join(cel))
    u = res[anos[-1]]
    if a.preco and a.acoes:
        print(f"\nMULTIPLOS (preco {a.preco:.2f}, {a.acoes:,.0f} mi de acoes, dados de {anos[-1]})")
        print(f"  valor de mercado {f2(u.get('valor_mercado'))} | P/L {f2(u.get('pl_mult'), 'x')} | P/VP {f2(u.get('pvp'), 'x')} | "
              f"EV/EBIT {f2(u.get('ev_ebit'), 'x')} | EV/EBITDA {f2(u.get('ev_ebitda'), 'x')}")
        print(f"  earnings yield {pct(u.get('earnings_yield'), 1)} | fluxo (CFO+CFI) / valor de mercado {pct(u.get('fcf_yield'), 1)}")
    al = alertas(anos, res, a.selic, a.ipca)
    print("\nSINAIS DE ALERTA" if al else "\nSINAIS DE ALERTA: nenhum disparado pelos limiares padrao.")
    for x in al:
        print(f"  - {x}")
    print("\nOBS: EBITDA e ROIC sao aproximacoes (depreciacao somada por nome de conta, aliquota de 34%).")
    print("Compare com pares do mesmo setor antes de concluir qualquer coisa. Historico nao e previsao.")


if __name__ == "__main__":
    main()
