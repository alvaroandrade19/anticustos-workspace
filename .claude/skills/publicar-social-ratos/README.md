# Publicar Social Ratos

Skill de Claude Code pra publicar carrosséis e posts no Instagram e TikTok direto do terminal. Setup guiado, dois métodos disponíveis.

## O que faz

- Publica carrosséis, imagens e Reels no Instagram, e carrosséis no TikTok
- Dois métodos: **Post for Me** (multi-plataforma, pago) ou **Graph API** (só Instagram, gratuito)
- Setup conversacional na primeira vez
- Dry-run antes de publicar
- TikTok sempre como draft (pra escolher música no app)
- **Agenda post** pela Graph API, com o computador desligado, num Worker gratuito da Cloudflare

## Instalação

```bash
# baixe o zip de publicar-social-ratos na plataforma (Materiais) e descompacte em ~/.claude/skills/
```

## Como usar

```
publica o carrossel que acabei de criar
```

Ou com caminho:

```
publica conteudo/carrosseis/ia-no-varejo/instagram/
```

Na primeira vez, a skill guia o setup do método escolhido.

## Métodos

| | Post for Me | Graph API |
|---|---|---|
| **Plataformas** | Instagram, TikTok, LinkedIn | Só Instagram |
| **Setup** | 5 min (conta + API key) | ~15 min (app no Meta + token) |
| **Token expira?** | Não | A cada 60 dias (renovação por script) |
| **TikTok** | Sim (draft nativo) | Não |
| **Agendamento** | Nativo da plataforma | Worker da Cloudflare, incluído aqui |
| **Custo** | US$ 10/mês | Gratuito |

## Agendamento

A API do Instagram não tem agendamento nativo: não existe `scheduled_publish_time` e o
container de mídia expira em 24h. A skill resolve isso com uma fila num KV da Cloudflare e
um Worker que acorda de 5 em 5 minutos, cria o container e publica na hora marcada. Tudo no
plano gratuito.

As imagens sobem pro host público na hora do agendamento, aqui da máquina. Só URL e legenda
vão pra Cloudflare, nenhum byte de imagem passa por lá.

```bash
node scripts/deploy-worker.js                                   # implanta o Worker
node scripts/agendar.js --pasta <pasta> --quando "+2h" --dry    # simula
node scripts/agendar.js --pasta <pasta> --quando "2026-09-10 08:30"
node scripts/fila.js                                            # ver a fila
```

## Estrutura

```
publicar-social-ratos/
├── SKILL.md
├── worker/
│   └── worker.js              Worker da Cloudflare que publica a fila
└── scripts/
    ├── publish-postforme.js   publicação imediata via Post for Me
    ├── publish-graph-api.js   publicação imediata via Graph API
    ├── agendar.js             põe um post na fila
    ├── fila.js                lista, cancela, dispara
    ├── deploy-worker.js       implanta ou atualiza o Worker
    ├── renovar-token.js       renova o token de 60 dias e reenvia pro Worker
    ├── otimizar.js            gera versões leves das imagens (1080px, JPEG)
    ├── lib-instagram.js       env, validações, upload, Graph API
    └── lib-cloudflare.js      cliente mínimo de KV e Workers
```

## Pré-requisitos

- **Post for Me:** conta em postforme.dev + `POSTFORME_API_KEY` no `.env`
- **Graph API:** app Business no Meta Developer com "API do Instagram com login do Instagram",
  conta profissional do Instagram, e `INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_USER_ID` no `.env`.
  Não precisa de chave de host de imagem: o upload usa catbox, que é aberto
- **Agendamento:** `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` no `.env`
- **otimizar.js:** Playwright (`npm install playwright`)
- **Node.js** 18+ pra rodar os scripts

## Licença

CC BY 4.0
