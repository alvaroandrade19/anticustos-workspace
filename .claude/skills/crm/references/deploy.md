# Publicar — ação de mundo real, sempre confirmar antes

Diferente do starter original, aqui não existe "aluno que assusta com jargão". Diga o custo e a
ação direto: publicar significa subir um container numa VPS, ~R$40/mês, cobrado no cartão dele.
**Nunca prossiga sem confirmação explícita nesta sessão.**

## Provedor
Sem link de afiliado. Se ele já tem VPS (Hostinger ou outra), usa essa. Se não tem, apresente a
opção e deixe a escolha do provedor com ele — não empurre um específico.

## Se for Hostinger (guia técnico, sem esconder nada)
1. Painel Hostinger → API → gerar token → colar. Guardar em `app.env` na VPS
   (`HOSTINGER_API_TOKEN`, nunca no repo).
2. Resto pela API (`https://developers.hostinger.com`): listar/criar VM, pegar IP, instalar
   Docker. Mande um `User-Agent` de navegador normal (a API às vezes bloqueia sem isso, erro
   CF 1010).
3. Domínio: usar o hostname padrão da VPS (`*.hstgr.cloud`) é suficiente — HTTPS incluso via
   Let's Encrypt no proxy. Só configurar domínio próprio se ele pedir.

## Preparar o servidor
- Docker: `curl -fsSL https://get.docker.com | sh`.
- `/opt/crm/app.env` com as chaves server-side (`chmod 600`).
- Reverse proxy com HTTPS: Caddy (mais simples, 1 linha por domínio) ou Traefik.

## Deploy
`deploy.sh` (em `crm/`) manda o código → build na VPS → sobe o container. Ajustar `VPS` e `KEY`
no script antes de rodar. Confira o link responde `200` e cai no login.

## Sync
Se Composio/cron estiver ligado, garanta que roda na VPS também, senão o dado para de atualizar
assim que sair do ar localmente.

## Regras
HTTPS sempre. Segredo só em `app.env` (600), nunca no repo ou no browser. Confirmar com o Alvaro
antes de cada subida, não só na primeira.
