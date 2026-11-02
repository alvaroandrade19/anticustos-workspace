"""Valuation: DCF, sensibilidade, cenarios, Monte Carlo, Gordon, CAPM e Graham.

Tudo em Python puro. Unidades livres, mas use as mesmas em todo argumento (ex: R$ milhoes
para fluxo e divida, milhoes de acoes). Taxas em decimal (0.15 = 15%).

Exemplos:
  python valuation.py dcf --fcf0 5000 --g1 0.10 --gp 0.04 --wacc 0.15 --divida-liquida 8000 --acoes 1300 --preco 30
  python valuation.py cenarios --fcf0 5000 --divida-liquida 8000 --acoes 1300 --preco 30 \\
      --cenario baixa:0.03,0.03,0.17,0.25 --cenario base:0.08,0.04,0.15,0.50 --cenario alta:0.12,0.05,0.14,0.25
  python valuation.py montecarlo --fcf0 5000 --divida-liquida 8000 --acoes 1300 --preco 30 \\
      --g1 0.04,0.08,0.12 --gp 0.02,0.04,0.05 --wacc 0.13,0.15,0.18
  python valuation.py reverso --fcf0 5000 --gp 0.04 --wacc 0.15 --divida-liquida 8000 --acoes 1300 --preco 45
  python valuation.py gordon --dividendo 2.0 --r 0.14 --g 0.05
  python valuation.py capm --rf 0.1375 --beta 1.1 --erp 0.06
  python valuation.py graham --lpa 4.0 --vpa 25.0 --preco 60

O modelo e uma maquina de transformar premissas em numero. A qualidade esta nas premissas,
e quem as escreve responde por elas. Resultado sempre sai como faixa, nunca como alvo unico.
"""

import argparse
import random

from _comum import percentil, utf8

LIMITE_TV = 0.75  # acima disso, o valor mora quase todo na perpetuidade
GP_MAX_AVISO = 0.06  # crescimento perpetuo nominal acima disso exige defesa


def projetar(fcf0, g1, gp, anos):
    """Fluxos dos anos 1..N com o crescimento caindo em linha reta de g1 ate gp."""
    fluxos, fcf = [], fcf0
    for t in range(1, anos + 1):
        g = g1 + (gp - g1) * (t - 1) / max(anos - 1, 1)
        fcf *= 1 + g
        fluxos.append(fcf)
    return fluxos


def dcf(fcf0, g1, gp, wacc, anos, divida_liquida, acoes):
    if wacc <= gp:
        raise ValueError("WACC precisa ser maior que o crescimento perpetuo, senao o valor explode")
    fluxos = projetar(fcf0, g1, gp, anos)
    vp = sum(f / (1 + wacc) ** t for t, f in enumerate(fluxos, 1))
    tv = fluxos[-1] * (1 + gp) / (wacc - gp)
    vp_tv = tv / (1 + wacc) ** anos
    ev = vp + vp_tv
    equity = ev - divida_liquida
    return {"ev": ev, "equity": equity, "por_acao": equity / acoes, "peso_tv": vp_tv / ev,
            "vp_fluxos": vp, "vp_tv": vp_tv}


def comum(ap):
    ap.add_argument("--fcf0", type=float, required=True, help="fluxo de caixa livre do ultimo ano")
    ap.add_argument("--anos", type=int, default=5)
    ap.add_argument("--divida-liquida", type=float, default=0.0)
    ap.add_argument("--acoes", type=float, required=True)
    ap.add_argument("--preco", type=float)


def avisos(r, gp, fcf0):
    out = []
    if fcf0 <= 0:
        out.append("FCF inicial nao positivo: DCF de perpetuidade nao se aplica, use outro metodo")
    if r["peso_tv"] > LIMITE_TV:
        out.append(f"{r['peso_tv']:.0%} do valor vem da perpetuidade (limite {LIMITE_TV:.0%}): resultado frágil")
    if gp > GP_MAX_AVISO:
        out.append(f"crescimento perpetuo de {gp:.1%} e alto para termo nominal: defenda ou reduza")
    return out


def cmd_dcf(a):
    r = dcf(a.fcf0, a.g1, a.gp, a.wacc, a.anos, a.divida_liquida, a.acoes)
    print(f"DCF: g1 {a.g1:.1%} caindo a {a.gp:.1%} em {a.anos} anos, WACC {a.wacc:.1%}")
    print(f"  valor da firma (EV):   {r['ev']:,.0f}")
    print(f"  valor do acionista:    {r['equity']:,.0f}")
    print(f"  valor por acao:        {r['por_acao']:,.2f}")
    print(f"  peso da perpetuidade:  {r['peso_tv']:.0%}")
    if a.preco:
        ms = 1 - a.preco / r["por_acao"]
        print(f"  preco atual {a.preco:,.2f} -> margem de seguranca {ms:.0%} (positiva = abaixo do valor calculado)")
    for w in avisos(r, a.gp, a.fcf0):
        print(f"  ! {w}")
    print("\nSensibilidade (valor por acao). Linhas: WACC. Colunas: crescimento perpetuo.")
    gps = [a.gp - 0.01, a.gp - 0.005, a.gp, a.gp + 0.005, a.gp + 0.01]
    print(f"{'WACC':>8}" + "".join(f"{g:>10.1%}" for g in gps))
    for dw in (-0.02, -0.01, 0, 0.01, 0.02):
        w = a.wacc + dw
        cel = []
        for g in gps:
            try:
                cel.append(f"{dcf(a.fcf0, a.g1, g, w, a.anos, a.divida_liquida, a.acoes)['por_acao']:>10.2f}")
            except ValueError:
                cel.append(f"{'n/a':>10}")
        print(f"{w:>8.1%}" + "".join(cel))
    print("Leia a tabela inteira: se a decisao muda dentro desta faixa de premissas, ela nao esta decidida.")


def cmd_cenarios(a):
    tot_p, esperado = 0.0, 0.0
    print(f"{'cenario':<10}{'g1':>7}{'gp':>7}{'WACC':>7}{'prob':>7}{'valor/acao':>12}")
    for c in a.cenario:
        nome, resto = c.split(":")
        g1, gp, w, p = [float(x) for x in resto.split(",")]
        r = dcf(a.fcf0, g1, gp, w, a.anos, a.divida_liquida, a.acoes)
        tot_p += p
        esperado += p * r["por_acao"]
        print(f"{nome:<10}{g1:>7.1%}{gp:>7.1%}{w:>7.1%}{p:>7.0%}{r['por_acao']:>12.2f}")
    if abs(tot_p - 1) > 0.01:
        print(f"  ! probabilidades somam {tot_p:.0%}, nao 100%")
    print(f"valor esperado ponderado: {esperado / tot_p:,.2f}")
    if a.preco:
        print(f"preco atual {a.preco:,.2f}: {a.preco / (esperado / tot_p) - 1:+.0%} em relacao ao valor esperado")
    print("As probabilidades sao julgamento seu, nao dado. Diga isso no relatorio.")


def tri(txt):
    lo, moda, hi = [float(x) for x in txt.split(",")]
    return lo, moda, hi


def cmd_mc(a):
    random.seed(a.semente)
    g1, gp, w = tri(a.g1), tri(a.gp), tri(a.wacc)
    vals, descartes = [], 0
    for _ in range(a.n):
        g1s = random.triangular(g1[0], g1[2], g1[1])
        gps = random.triangular(gp[0], gp[2], gp[1])
        ws = random.triangular(w[0], w[2], w[1])
        if ws - gps < 0.02:
            descartes += 1
            continue
        vals.append(dcf(a.fcf0, g1s, gps, ws, a.anos, a.divida_liquida, a.acoes)["por_acao"])
    print(f"Monte Carlo: {len(vals)} simulacoes validas de {a.n} (semente {a.semente}, distribuicao triangular)")
    print(f"  P10 {percentil(vals, .10):,.2f} | P25 {percentil(vals, .25):,.2f} | mediana {percentil(vals, .50):,.2f} "
          f"| P75 {percentil(vals, .75):,.2f} | P90 {percentil(vals, .90):,.2f}")
    if a.preco:
        prob = sum(1 for v in vals if v < a.preco) / len(vals)
        print(f"  preco atual {a.preco:,.2f} fica acima de {prob:.0%} das simulacoes")
    if descartes:
        print(f"  {descartes} sorteios descartados por WACC menos crescimento abaixo de 2 pontos")
    print("A faixa mede a incerteza que VOCE declarou nas premissas, nao a incerteza do mundo.")


def cmd_reverso(a):
    """Que crescimento (g1) o preco atual embute, dado WACC e crescimento perpetuo?"""
    alvo = a.preco

    def v(g1):
        return dcf(a.fcf0, g1, a.gp, a.wacc, a.anos, a.divida_liquida, a.acoes)["por_acao"]

    lo, hi = -0.30, 0.60
    if not (v(lo) <= alvo <= v(hi)):
        print(f"Preco {alvo:,.2f} fora do alcance do modelo entre g1 {lo:.0%} e {hi:.0%} com essas premissas.")
        print("Ou o preco exige premissa fora do razoavel, ou WACC/crescimento perpetuo/FCF inicial estao errados.")
        return
    for _ in range(80):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if v(mid) < alvo else (lo, mid)
    g = (lo + hi) / 2
    print(f"DCF reverso: com WACC {a.wacc:.1%} e crescimento perpetuo {a.gp:.1%}, o preco {alvo:,.2f} so fecha")
    print(f"se o fluxo de caixa crescer {g:.1%} ao ano nos primeiros anos, caindo ate {a.gp:.1%} em {a.anos} anos.")
    print("Pergunta que decide: esse crescimento e plausivel para este negocio, neste setor, com este historico?")


def cmd_gordon(a):
    if a.r <= a.g:
        raise SystemExit("r precisa ser maior que g")
    v = a.dividendo / (a.r - a.g)
    print(f"Gordon: dividendo do proximo ano {a.dividendo:.2f}, r {a.r:.1%}, g {a.g:.1%} -> valor {v:.2f}")
    print("Serve para pagadora estavel de dividendo. Ruim para empresa ciclica ou de payout irregular.")


def cmd_capm(a):
    ke = a.rf + a.beta * a.erp + a.crp
    extra = f" + {a.crp:.2%} (risco-pais)" if a.crp else ""
    print(f"CAPM: custo do capital proprio = {a.rf:.2%} + {a.beta:.2f} x {a.erp:.2%}{extra} = {ke:.2%}")
    print("Dois caminhos coerentes (ver references/valuation.md, numeros do Damodaran de jan/2026):")
    print("  em dolar: rf EUA + beta x 4,23% (ERP maduro) + 3,24% (CRP Brasil), depois converta pela inflacao;")
    print("  em reais: (juro longo em reais - 2,13% de spread soberano) + beta x 7,47% (ERP total Brasil), sem --crp.")
    print("Nao misture: rf em reais ja carrega o risco soberano. Declare de onde saiu cada numero.")


def cmd_graham(a):
    import math
    v = math.sqrt(22.5 * a.lpa * a.vpa) if a.lpa > 0 and a.vpa > 0 else None
    if v is None:
        raise SystemExit("Graham exige lucro por acao e patrimonio por acao positivos")
    print(f"Numero de Graham: {v:.2f}" + (f" | preco {a.preco:.2f} ({a.preco / v - 1:+.0%})" if a.preco else ""))
    print("Filtro grosseiro de empresa madura e lucrativa. Nao use em crescimento, banco ou ciclica no pico do lucro.")


def main():
    utf8()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    d = sub.add_parser("dcf")
    comum(d)
    d.add_argument("--g1", type=float, required=True)
    d.add_argument("--gp", type=float, required=True)
    d.add_argument("--wacc", type=float, required=True)
    d.set_defaults(f=cmd_dcf)

    rv = sub.add_parser("reverso")
    comum(rv)
    rv.add_argument("--gp", type=float, required=True)
    rv.add_argument("--wacc", type=float, required=True)
    rv.set_defaults(f=cmd_reverso)

    c = sub.add_parser("cenarios")
    comum(c)
    c.add_argument("--cenario", action="append", required=True, help="nome:g1,gp,wacc,prob")
    c.set_defaults(f=cmd_cenarios)

    m = sub.add_parser("montecarlo")
    comum(m)
    for k in ("g1", "gp", "wacc"):
        m.add_argument(f"--{k}", required=True, help="minimo,mais provavel,maximo")
    m.add_argument("--n", type=int, default=10000)
    m.add_argument("--semente", type=int, default=42)
    m.set_defaults(f=cmd_mc)

    g = sub.add_parser("gordon")
    g.add_argument("--dividendo", type=float, required=True)
    g.add_argument("--r", type=float, required=True)
    g.add_argument("--g", type=float, required=True)
    g.set_defaults(f=cmd_gordon)

    k = sub.add_parser("capm")
    k.add_argument("--rf", type=float, required=True)
    k.add_argument("--beta", type=float, required=True)
    k.add_argument("--erp", type=float, required=True)
    k.add_argument("--crp", type=float, default=0.0, help="premio de risco-pais, so no caminho em dolar")
    k.set_defaults(f=cmd_capm)

    r = sub.add_parser("graham")
    r.add_argument("--lpa", type=float, required=True)
    r.add_argument("--vpa", type=float, required=True)
    r.add_argument("--preco", type=float)
    r.set_defaults(f=cmd_graham)

    a = ap.parse_args()
    try:
        a.f(a)
    except ValueError as e:
        raise SystemExit(f"Erro: {e}")


if __name__ == "__main__":
    main()
