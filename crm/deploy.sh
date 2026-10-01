#!/usr/bin/env bash
# Deploy do CRM Anti Custos na VPS. A skill /crm preenche VPS e domínio na Fase de publicação.
# Manda o working tree → build na VPS → sobe o container. Preserva mudanças não commitadas.
set -euo pipefail

VPS="root@SEU_IP_DA_VPS"        # <- preenchido na hora de publicar (IP da VPS)
KEY="$HOME/.ssh/crm_vps"        # <- chave SSH da VPS
APPDIR="/opt/crm/app"
cd "$(dirname "$0")"

echo "▸ build local (sanidade)…"; npm run build >/dev/null

echo "▸ enviando + build + subindo na VPS…"
git ls-files -z --cached --others --exclude-standard | tar --null -T - -cf - | \
ssh -i "$KEY" -o ConnectTimeout=20 "$VPS" '
  mkdir -p '"$APPDIR"' && tar -xf - -C '"$APPDIR"' && cd '"$APPDIR"' &&
  docker build -t crm-anti-custos:latest . &&
  docker rm -f crm-anti-custos 2>/dev/null || true &&
  docker run -d --name crm-anti-custos --restart always --env-file /opt/crm/app.env -p 127.0.0.1:3000:3000 crm-anti-custos:latest
'
echo "✓ no ar (aponte o proxy/domínio pra porta 3000)"
