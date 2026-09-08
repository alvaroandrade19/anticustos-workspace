# Tarefas: Anti Custos

## Integrações pra configurar depois

- [ ] **Google Drive:** conector oficial. Autorizar em claude.ai > Settings > Connectors
- [ ] **Canva:** `claude mcp add canva -- npx -y @canva/canva-mcp-server` (exige Canva Pro)
- [ ] **Instagram (publicação automática):** criar conta em postforme.dev e salvar `POSTFORME_API_KEY` no `.env`
- [ ] **Meta Ads:** token de longa duração da Marketing API, ou usar a skill `/meta-ads-ratos`
- [ ] **WhatsApp Business:** WhatsApp Cloud API (oficial Meta) ou Z-API. Tokens no `.env`
- [x] **LinkedIn:** configurado e testado em 08/09/2026. App criado, produtos self-serve liberados, token no `.env`. Fluxo completo validado de ponta a ponta (publicação com 9 imagens e despublicação). Comandos: `/linkedin` ou `/postar-linkedin`
- [ ] **LinkedIn, renovação:** token vence em 07/11/2026. Rodar `node .claude/skills/postar-linkedin/scripts/auth.js --servidor` quando o `status.js` avisar. Ele reenvia o token pro Worker sozinho
- [x] **Agendamento de post:** Worker na Cloudflare com cron de 5 minutos, publica com o PC desligado. Grátis. Subdomínio `anticustos.workers.dev`

## Marca

- [ ] Definir e criar o logo da Anti Custos (versão para fundo escuro é a prioritária)
- [ ] Preencher o handle do Instagram e do LinkedIn em `marca/design-guide.md`

## Próximos passos do sistema

- [ ] Rodar `/mapear` para criar as skills do dia a dia
- [ ] Rodar `/syncar` para conectar este workspace ao GitHub
