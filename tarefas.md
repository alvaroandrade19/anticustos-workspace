# Tarefas: Anti Custos

## Integrações pra configurar depois

- [ ] **Google Drive:** conector oficial. Autorizar em claude.ai > Settings > Connectors
- [ ] **Canva:** `claude mcp add canva -- npx -y @canva/canva-mcp-server` (exige Canva Pro)
- [x] **Instagram (publicação automática):** configurado em 08/09/2026 pela Graph API, não pelo Post for Me (gratuito, sem intermediário). App Business no Meta Developer, produto "API do Instagram com login do Instagram", conta `anticustos.ia` (BUSINESS). `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_USER_ID` no `.env`, script em `scripts/publish-graph-api.js`. Comando: `/publicar-social-ratos`
- [ ] **Instagram, renovação:** token vence em 07/11/2026. Renovar com `node --env-file=.env -e "fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token='+process.env.INSTAGRAM_ACCESS_TOKEN).then(r=>r.json()).then(j=>console.log(j.access_token))"` e trocar a linha no `.env`
- [ ] **Instagram, agendamento:** não existe na API (sem `scheduled_publish_time`, container expira em 24h). Para agendar, adaptar o Worker da Cloudflare do LinkedIn: subir imagens pro catbox no agendamento, guardar URL e legenda no KV, criar container e publicar no cron
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
