# Tarefas: Anti Custos

## Integrações pra configurar depois

- [x] **ffmpeg:** instalado em 14/09/2026 via `winget install Gyan.FFmpeg` (versão 9.0.1), no PATH do usuário. Quem usa é a skill `/reels`: transcrição local do áudio, conferência de frames do vídeo pronto e motor reserva de render. Num terminal aberto antes da instalação o PATH ainda é o velho, então reabrir o Claude Code depois de instalar
- [ ] **Google Drive:** conector oficial. Autorizar em claude.ai > Settings > Connectors
- [ ] **Canva:** `claude mcp add canva -- npx -y @canva/canva-mcp-server` (exige Canva Pro)
- [x] **Instagram (publicação automática):** configurado em 08/09/2026 pela Graph API, não pelo Post for Me (gratuito, sem intermediário). App Business no Meta Developer, produto "API do Instagram com login do Instagram", conta `anticustos.ia` (BUSINESS). `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_USER_ID` no `.env`, script em `scripts/publish-graph-api.js`. Comando: `/publicar-social-ratos`
- [x] **Instagram, host de imagem:** catbox.moe saiu em 16/09/2026 (a Meta passou a recusar todo container apontando pra lá). Hoje o principal é o **R2 da Cloudflare** (Worker `anticustos-imagens`) e a reserva é o **imgbb** (`IMGBB_API_KEY`). Vídeo de Reels segue no catbox
- [x] **Instagram, redundância de verdade:** a imagem sobe nos dois hosts e as duas URLs vão pra fila. Quem troca de host é o Worker na hora de publicar, porque é só aí que dá pra descobrir que a Meta não consegue baixar. Validado em produção no mesmo dia, com o imgbb fora do ar
- [x] **Teto do R2:** bucket apaga objeto com mais de 30 dias sozinho, upload limitado a 10MB, aviso no `fila.js` acima de 1GB. Regra escrita no `AGENTS.md` porque o cartão está vinculado à conta
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
