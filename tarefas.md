# Tarefas: Anti Custos

## Integrações pra configurar depois

- [ ] **Google Drive:** conector oficial. Autorizar em claude.ai > Settings > Connectors
- [ ] **Canva:** `claude mcp add canva -- npx -y @canva/canva-mcp-server` (exige Canva Pro)
- [x] **Instagram (publicação automática):** configurado em 08/09/2026 pela Graph API, não pelo Post for Me (gratuito, sem intermediário). App Business no Meta Developer, produto "API do Instagram com login do Instagram", conta `anticustos.ia` (BUSINESS). `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_USER_ID` no `.env`, script em `scripts/publish-graph-api.js`. Comando: `/publicar-social-ratos`
- [ ] **Instagram, renovação:** token vence em 07/11/2026. Rodar `node .claude/skills/publicar-social-ratos/scripts/renovar-token.js`. Ele grava o token novo no `.env` e reenvia pro Worker sozinho (`--status` só mostra quanto falta)
- [x] **Sincronização automática:** o `/iniciar` roda `scripts/sincronizar-publicacoes.js` no começo de cada sessão, que reconcilia as filas das duas redes, move as pastas e avisa de post que falhou
- [x] **Ciclo de vida da peça:** feito em 08/09/2026. `conteudo/agendado/<rede>/` e `conteudo/publicado/<rede>/`, com as skills movendo a pasta sozinhas e gravando `_estado.md`. Vale pro LinkedIn e pro Instagram
- [x] **Instagram, agendamento:** feito em 08/09/2026. Worker `anticustos-instagram-agendador` com KV próprio e cron de 5 minutos, separado do do LinkedIn. Validado de ponta a ponta: carrossel de 9 slides agendado e publicado sozinho pelo cron. Comandos em `.claude/skills/publicar-social-ratos/scripts/`: `agendar.js`, `fila.js`, `deploy-worker.js`, `renovar-token.js`, `otimizar.js`
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
