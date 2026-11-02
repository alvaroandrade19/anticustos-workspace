"""Triagem numerica: aplica as telas de cada filosofia (modelos/telas.json) a uma empresa.

Uso:
  python triagem.py weg.json --preco 45 --acoes 4200 --selic 0.1375
  python triagem.py weg.json --preco 45 --acoes 4200 --tela suno_checklist
  python triagem.py x.json --preco 20 --acoes 500 --dy 0.07 --div-anos 8 --tela bazin_barsi

Entrada: JSON do cvm.py (varios exercicios; quanto mais anos, mais regras avaliaveis).
Preco, acoes (milhoes), --dy e --div-anos vem de voce: a CVM DFP nao traz cotacao nem proventos.

Uma tela ELIMINA, nao recomenda. A propria Suno avisa que passar no filtro nao quer dizer
comprar todas as que passam. Regra sem dado ou sem limiar definido sai como N/D, nunca como
aprovada. Limiares nascem de outro mercado e outra taxa de juros: leia a nota da Selic no fim.
"""

import argparse
import json
import os
import statistics

from _comum import pct, utf8
from fundamentos import calc

OPS = {">=": lambda a, b: a >= b, "<=": lambda a, b: a <= b,
       ">": lambda a, b: a > b, "<": lambda a, b: a < b}
TELAS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "modelos", "telas.json")


def metricas(dados, preco, acoes, dy, div_anos, estatal=None):
    anos = sorted(k for k, v in dados["anos"].items() if "erro" not in v)
    if not anos:
        raise SystemExit("nenhum exercicio utilizavel no JSON")
    u = dados["anos"][anos[-1]]
    ant = dados["anos"][anos[-2]] if len(anos) > 1 else None
    r = calc(u, ant, preco, acoes)
    ll = [dados["anos"][a].get("lucro_liquido") for a in anos]
    ll_ok = [x for x in ll if x is not None]
    m = {"receita": u.get("receita"), "liquidez_corrente": r.get("liquidez_corrente"), "roe": r.get("roe"),
         "anos_sem_prejuizo_pct": sum(1 for x in ll_ok if x > 0) / len(ll_ok) if ll_ok else None,
         "dl_pl": (r["divida_liquida"] / u["patrimonio_liquido"]) if r.get("divida_liquida") is not None
         and u.get("patrimonio_liquido") else None,
         "dy": dy, "dividendos_anos": div_anos, "_n_anos": len(anos), "_anos": anos,
         "n_anos": len(anos), "prejuizos_ult5": sum(1 for x in ll_ok[-5:] if x < 0) if ll_ok else None,
         "estatal": None if estatal is None else (1 if estatal else 0)}
    m["cresc_lucro_trienal"] = None
    if len(ll_ok) >= 6 and statistics.mean(ll_ok[:3]) > 0:
        m["cresc_lucro_trienal"] = statistics.mean(ll_ok[-3:]) / statistics.mean(ll_ok[:3]) - 1
    if preco and acoes:
        mc = preco * acoes
        m["pl_atual"] = r.get("pl_mult")
        m["pvp"] = r.get("pvp")
        media3 = statistics.mean(ll_ok[-3:]) if len(ll_ok) >= 3 else None
        m["pl_medio3"] = mc / media3 if media3 and media3 > 0 else None
        m["pl_x_pvp"] = m["pl_medio3"] * m["pvp"] if m["pl_medio3"] and m["pvp"] else None
    return m


def avalia(cond, m):
    v = m.get(cond["metrica"])
    lim = cond["valor"]
    if v is None or lim is None:
        return None, v
    return OPS[cond["op"]](v, lim), v


def fmt(v):
    if v is None:
        return "n/d"
    return f"{v:,.2f}" if abs(v) >= 5 else f"{v:.3f}"


def roda(nome_tela, tela, m):
    print(f"\n=== {tela['nome']} ===\nFonte: {tela['fonte']}")
    ok = falha = nd = 0
    for rg in tela["regras"]:
        if "ou" in rg:
            res = [avalia(c, m) for c in rg["ou"]]
            if any(r[0] for r in res):
                st = True
            elif all(r[0] is None for r in res):
                st = None
            else:
                st = False
            vals = " | ".join(f"{c['metrica']} {fmt(r[1])}" for c, r in zip(rg["ou"], res))
        else:
            st, v = avalia(rg, m)
            vals = f"{rg['metrica']} {fmt(v)} (limiar {rg['op']} {rg['valor'] if rg['valor'] is not None else 'a definir'})"
        janela = st is True and rg.get("min_anos") and m["_n_anos"] < rg["min_anos"]
        marca = "PASSA*" if janela else {True: "PASSA ", False: "FALHA ", None: "N/D   "}[st]
        ok, falha, nd = ok + (st is True), falha + (st is False), nd + (st is None)
        extra = ""
        if st is None and rg.get("obs"):
            extra = f"\n           obs: {rg['obs']}"
        if janela:
            extra = f"\n           * janela curta: {m['_n_anos']} exercicio(s) de dado, a regra de origem pede {rg['min_anos']}"
        print(f"  [{marca}] {rg['desc']}\n           {vals}{extra}")
    print(f"  Resultado: {ok} passam, {falha} falham, {nd} sem dado ou sem limiar, de {len(tela['regras'])} regras (PASSA* = aprovacao parcial).")


def main():
    utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("json")
    ap.add_argument("--preco", type=float)
    ap.add_argument("--acoes", type=float, help="milhoes de acoes")
    ap.add_argument("--dy", type=float, help="dividend yield medio, decimal (0.06 = 6%%)")
    ap.add_argument("--div-anos", type=int, help="anos seguidos pagando dividendos")
    ap.add_argument("--selic", type=float)
    ap.add_argument("--estatal", choices=["s", "n"], help="a empresa e controlada pelo governo?")
    ap.add_argument("--tela", help="id da tela; sem isso roda todas as ativas")
    a = ap.parse_args()
    dados = json.load(open(a.json, encoding="utf-8"))
    todas = {k: v for k, v in json.load(open(TELAS, encoding="utf-8")).items() if not k.startswith("_")}
    telas = {a.tela: todas[a.tela]} if a.tela else {k: v for k, v in todas.items() if v.get("ativa", True)}
    mk = dados.get("mercado") or {}
    preco, acoes = a.preco or mk.get("preco"), a.acoes or mk.get("acoes")
    a.preco, a.acoes = preco, acoes
    m = metricas(dados, preco, acoes, a.dy, a.div_anos, None if a.estatal is None else a.estatal == "s")
    print(f"{dados.get('empresa', '?')} | exercicios: {', '.join(m['_anos'])} | fonte: {dados.get('fonte', 'manual')}")
    if not (a.preco and a.acoes):
        print("Sem --preco e --acoes: regras de preco (P/L, P/VP) saem como N/D.")
    for k, t in telas.items():
        roda(k, t, m)
    print("\nLEITURA")
    print("  Tela elimina, nao recomenda. Quem passa ainda precisa de entendimento do negocio e valor em faixa.")
    print(f"  Janela de {m['_n_anos']} exercicio(s): regras que pedem 10 ou 20 anos ficam N/D ou fracas.")
    if a.selic:
        print(f"  Selic de {pct(a.selic, 2)}: um P/L de 15x equivale a lucro/preco de {pct(1 / 15, 1)}, "
              f"{'abaixo' if 1 / 15 < a.selic else 'acima'} da Selic; P/L de 20x, {pct(1 / 20, 1)}.")
        print("  Limiar de P/L e DY nascido com juro baixo exige crescimento do lucro para se pagar. Recalibre contra a Regua.")


if __name__ == "__main__":
    main()
