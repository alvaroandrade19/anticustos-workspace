# biblioteca-icones.md — the icon library (breadth half of the hybrid object system)

The reel has a `icon` visual backed by **5093 Tabler outline icons** (MIT — free for the paid pack),
shipped in `assets/icons/tabler-nodes-outline.json`. This is how a reel gets a DISTINCT, meaningful
object on (almost) every beat without repeating. The hand-built HERO visuals (orb, grid, device,
crowd, chart, counter, hero3d) stay — use them for their strengths; use `icon` for the long tail.

## How it works (what the director does per beat)
1. Pick an icon NAME that ENACTS the line's meaning (a concrete noun/verb — "pasta", "foguete",
   "lâmpada"). Prefer the palette below; for anything else, grep the JSON keys (5093 names).
2. Read that icon's path `d` strings from the JSON. Format: `{"folder": [["path",{"d":"..."}], ...]}`.
   Quick read (one icon):
   ```
   node -e "const i=require('fs').readFileSync('assets/icons/tabler-nodes-outline.json','utf8');console.log(JSON.stringify(JSON.parse(i)['rocket'].map(p=>p[1].d)))"
   ```
3. Inline the paths into the scene:
   `{"visual":"icon","text":"...","paths":["d1","d2",...],"viewBox":"0 0 24 24","hold":...}`
   The engine draws it on (stroke), **white + a soft accent glow**, auto-centered + auto-sized by the
   composition system. ViewBox is ALWAYS `0 0 24 24` for Tabler icons (the stroke auto-scales).

## Non-negotiable rules
- **NEVER repeat an object in the same reel.** Each beat = a different icon (or a different hero
  visual). Keep a running set of what you've used. This was the #1 complaint — no two same spheres,
  no two same icons.
- **Meaning over decoration.** The icon must ENACT the line ("colocar numa pasta" → `folder`;
  "clica no botão" → `hand-click` or `arrow-down`), not just loosely associate.
- **Mix heroes + icons.** Don't make all 8 beats icons. Open with a hero (orb / device / grid),
  punctuate with icons, close on a hero or a CTA icon. Heroes carry brand/atmosphere; icons carry
  variety/specificity.
- Keep icons to **≤14 paths** (the engine caps there). Almost all Tabler icons are ≤8.

## Curated palette (PT concept → Tabler name) — all verified to exist
Use these first (fast + reliable). For concepts not here, grep the JSON.

**IA / tech / código**
- ideia / lâmpada → `bulb` · IA / cérebro / inteligência → `brain` · robô / automação → `robot`
- código / programar → `code` · terminal → `terminal-2` · computador / PC → `device-desktop`
- celular → `device-mobile` · rede / conexão → `network` · nuvem → `cloud` · internet / wifi → `wifi`
- IA / mágica / brilho → `sparkles` · varinha / criar do nada → `wand` · link → `link`

**Ação / movimento / direção**
- foguete / lançar / decolar → `rocket` · raio / energia / turbo → `bolt` · fogo / em alta → `flame`
- alvo / meta / foco → `target` · crescimento / subir → `trending-up` · passo a passo → `stairs-up`
- clique / toque → `hand-click` · pra baixo / abaixo → `arrow-down` · avançar / próximo → `arrow-right`
- sair na frente / crescer → `arrow-up-right` · direção / rumo → `compass` · ilimitado → `infinity`

**Dinheiro / negócio / dados**
- moeda / dinheiro → `coin` · grana → `cash` · real / faturamento → `currency-dollar`
- cartão / pix / pagamento → `credit-card` · carrinho / compra → `shopping-cart` · loja → `building-store`
- trabalho / profissional → `briefcase` · gráfico / resultado → `chart-line` · barras / dados → `chart-bar`
- métricas → `chart-dots` · balança / equilíbrio / advogado → `scale` · apresentação / pitch → `presentation`

**Pessoas / social**
- pessoas / público / audiência → `users` · pessoa / cliente / perfil → `user` · curtir / amor → `heart`
- joinha / like → `thumb-up` · mensagem / whatsapp → `message-circle` · conversa → `message`
- e-mail → `mail` · notificação / aviso → `bell` · megafone / divulgar → `speakerphone`
- compartilhar → `share` · mundo / global / alcance → `world`

**Conquista / valor / aprovação**
- troféu / vitória → `trophy` · estrela / destaque / avaliação → `star` · coroa / top → `crown`
- diamante / premium / valor → `diamond` · presente / bônus → `gift` · certificado / diploma → `certificate`
- feito / ok / concluído → `circle-check` (ou `check`) · marco / objetivo → `flag`
- crescimento / semente / evoluir → `growth` (ou `plant-2`)

**Objetos / utilidades**
- pasta → `folder` (aberta → `folder-open`) · caixa / produto / pacote → `package` (ou `box`)
- arquivo / documento → `file-text` (ou `file`) · lista / checklist → `list-check` · livro / conteúdo → `book`
- escola / aula / aprender → `school` · escrever / editar → `pencil` · salvar / marcar → `bookmark`
- chave / acesso → `key` · cadeado / trancado → `lock` · escudo / segurança → `shield` (ok → `shield-check`)
- olho / visão / ver → `eye` · busca / procurar → `search` · escanear / analisar → `zoom-scan`
- baixar → `download` · enviar / subir → `upload` · configuração / engrenagem → `settings`
- ferramenta → `tool` (várias → `tools`) · encaixe / peça → `puzzle` · relógio / tempo → `clock`
- calendário / agenda / data → `calendar` · localização / lugar → `map-pin` · bateria / energia → `battery`
- digital / único → `fingerprint` · identidade → `id` · câmera → `camera` · foto / imagem → `photo`
- filme / vídeo → `movie` · play → `player-play`

## Fallback (anything not in the palette)
The JSON has 5093 names (English, kebab-case). To find one for a concept, grep the keys:
```
node -e "const k=Object.keys(JSON.parse(require('fs').readFileSync('assets/icons/tabler-nodes-outline.json','utf8')));console.log(k.filter(n=>n.includes('SUBSTRING')).join(', '))"
```
e.g. `SUBSTRING='arrow'`, `'chart'`, `'device'`, `'building'`. Pick the cleanest match, read its paths,
inline. If genuinely nothing fits, fall back to a hero visual or the bespoke `svg` (you author a path).
