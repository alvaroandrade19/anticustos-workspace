# biblioteca-movimento.md — the MOVING-object system (the "se mexe" heroes + how to invent new ones)

A reel feels alive when its objects MOVE the whole time, not just draw on and freeze. This is the
catalog of continuously-animated visuals, plus the lever to CREATE a brand-new moving visual when
nothing here fits. Pair this with `reference/biblioteca-icones.md` (the 5093-icon breadth library).

## The decision order (per beat)
1. **A moving HERO that ENACTS the line?** Use it (table below). These are bespoke, premium, and move
   forever — first choice for any beat whose meaning matches one.
   **Prefer a RECOGNIZABLE REAL OBJECT** (lightbulb, shield, trophy, phone, target, plant, megaphone,
   bell, key, gift, funnel, checklist, magnet, lock, hourglass, globe, coins, rocket, gears…) — the
   viewer names the thing instantly and the caption confirms it = high impact. The abstract heroes
   (`brain`, `burst`, `constellation`, `particles`) read as pretty-but-vague line-clusters — use them
   sparingly, only when the line is genuinely abstract (e.g. "neural", "uma rede").
2. **A concrete noun/verb with no matching hero?** Use an `icon` (5093 Tabler, now floats + breathes).
   See `reference/biblioteca-icones.md`.
3. **Nothing fits?** INVENT one: author a bespoke `svg` path and give it a `motion` (see §Create-new).
   This is how the library is effectively infinite — you draw the metaphor, the engine animates it.

Always: **NEVER repeat an object in the same reel.** Mix heroes + icons + bespoke. Alternate calm/dense.

## The moving HEROES (continuous motion, premium) — concept → visual
**Brand / atmosphere**
- esfera de luz / a marca / abertura → `orb` · esfera 3D real (metálica, anéis) → `hero3d`

**Áudio / voz / fala** (on-brand: this skill is audio→video)
- voz / áudio / narração / som / fala / podcast → `waveform` (bars pulsing on a center line)

**Sistema / conexão / rede**
- sistema / ecossistema / tudo conectado / núcleo / em torno de → `orbit` (dots circling a core)
- rede / comunidade / conexões / pessoas / colaboração → `constellation` (drifting linked stars)
- estrutura / arquitetura (desenha e assenta) → `network` / `wireframe`

**Alcance / crescimento / movimento**
- alcance / viraliza / espalha / sinal / impacto / onda → `ripple` (expanding rings)
- lançar / decolar / crescer rápido / turbo / subir → `rocket` (rising rocket + flame + trail)
- crescimento / resultado / métrica subindo → `chart` (rising line) · número que sobe → `counter`
- correr / disputa / mais rápido / sair na frente → `figures` (running silhouettes)

**Processo / automação / busca**
- transforma X em Y / processo / esteira / fluxo / passo a passo → `pipeline` (packets through nodes)
- automação / funciona sozinho / engrenagem / mecanismo → `gears` (meshing gears)
- busca / encontra / varredura / analisa / monitora / descobre → `radar` (sweeping scan + blips)
- construir / programar / terminal rodando → `code` / `device` (3D monitor) — write REAL `code` lines

**IA / ideia / criação**
- IA / inteligência / pensar / aprender / cérebro / neural → `brain` (synapses firing across two lobes)
- ideia / insight / aha / estourou / eureka / sacada → `burst` (rays exploding from a bright core)
- escrever / criar / digitar / postar / produzir / texto → `typing` (keyboard lighting + a caret line filling)

**Negócio / clientes / dinheiro**
- funil / filtra / seleciona / converte / qualifica → `funnel` (dots converging through the funnel)
- atrai / atração / imã de clientes / capta / lead → `magnet` (dots pulled in toward the poles)
- dinheiro / faturamento / lucro / investimento / preço → `coins` (a coin stack; METAPHOR only — never put an
  income/earnings promise in the COPY; the estética guard forbids it)

**Método / tempo / acesso / mundo**
- passo a passo / checklist / método / pronto / organizado → `checklist` (items ticking off one by one)
- tempo / rápido / agora / prazo / urgência / economia → `hourglass` (sand draining at the neck)
- destrava / libera / acesso / exclusivo / segredo → `lock` (the shackle lifts open + glows)
- global / mundo / internet / alcance mundial / online → `globe` (spinning wireframe globe + markers)

**Objetos reais (alto impacto — reconhecíveis na hora)**
- ideia / sacou / clareou / acendeu / insight → `lightbulb` (real bulb clicks ON + rays) — preferir a `burst`
- segurança / proteção / blindado / sem risco / seguro → `shield` (scan sweep + check forming)
- vitória / conquista / campeão / o melhor / 1º lugar → `trophy` (cup + shine sweep + sparkles)
- no celular / app / post / feed / Instagram → `phone` (screen scrolling + like popping)
- meta / foco / alvo / acertar em cheio / mira → `target` (dart flies into the bullseye)
- crescer / do zero / evoluir / começar / florescer → `plant` (sprout grows, leaves unfurl)
- divulga / anuncia / alcança / grita / chamada → `megaphone` (bullhorn + pulsing sound waves)
- notificação / aviso / lembrete / engajamento / ativa → `bell` (bell swings + badge pops)
- a chave pra / solução / acesso / abre portas / segredo → `key` (key turns + glows)
- bônus / presente / brinde / surpresa / oferta → `gift` (lid lifts off + sparkle burst)

**Profundidade / cena cheia** (frame-filling 3D)
- chão/horizonte/mundo 3D → `grid` · monitor inclinado 3D → `device` · multidão marchando → `crowd`
  (`crowd` uses `place:"top"`)

## The 50-object library (`visual:object` — premium real objects by NAME, the easy breadth tier)
50 recognizable real objects shipped ready in `assets/remotion/src/objetos.ts` (Tabler-sourced shapes,
rendered bold white + accent glow, each with a FITTING motion already assigned — rocket rises, bell
swings, heart pulses, star spins, trophy/crown/diamond/medal shine). Use one by NAME — no paths to inline:

```json
{"visual":"object","name":"rocket","text":"...","hold":80}
```

The 50 names (→ meaning):
- **conquista/valor:** `rocket` (decolar) · `trophy` (vitória) · `crown` (no topo) · `diamond` (valor) ·
  `medal` (prêmio) · `gift` (bônus) · `flag` (meta) · `star` (destaque) · `thumb-up` (aprovado)
- **emoção/energia:** `heart` (curtir) · `flame` (em alta) · `bolt` (energia) · `sun` (energia) · `bell` (notificação)
- **dinheiro/negócio:** `coin` (dinheiro) · `wallet` (carteira) · `credit-card` (pagamento) ·
  `shopping-cart` (compra) · `building-store` (sua loja) · `briefcase` (trabalho) · `scale` (equilíbrio)
- **tempo/direção:** `clock` (tempo) · `calendar` (agenda) · `compass` (direção) · `map-pin` (local) · `hourglass`*
- **comunicação:** `microphone` (voz) · `headphones` (áudio) · `music` (música) · `mail` (e-mail) ·
  `send` (enviar) · `message-circle` (conversa) · `camera` (foto) · `eye` (visão)
- **criação/conhecimento:** `pencil` (escrever) · `book` (conteúdo) · `school` (aprender) · `palette` (design) ·
  `atom` (ciência) · `robot` (automação) · `settings` (ajustes) · `tool` (ferramenta) · `key` (acesso)
- **tech/mundo:** `wifi` (conectado) · `cloud` (na nuvem) · `battery` (carregado) · `fingerprint` (único) ·
  `plane` (viagem) · `car` (na estrada) · `umbrella` (proteção) · `leaf` (natureza)

(*`hourglass` is also a richer bespoke hero — both exist.) For any object NOT in this 50, fall back to the
`icon` tool (5093 Tabler, `reference/biblioteca-icones.md`) or invent one below. Same no-repeat rule.

## Create-new: bespoke `svg` + `motion` (the infinite lever)
When no hero and no icon fits the line, DRAW the concept yourself and bring it to life:

```json
{"visual":"svg","motion":"spin","text":"...","viewBox":"0 0 100 100","paths":["d1","d2"],"hold":80}
```

- **You author the `paths`** — SVG path `d` strings drawing a SPATIAL METAPHOR of the line (a star for
  "destaque", a heart for "o público ama", a winding line for "do zero ao topo", a mountain for "meta").
  Use a `0 0 100 100` viewBox, keep it to **≤5 simple paths**. Only `M L H V C S Q T A Z`, digits,
  spaces, dots, commas, minus are allowed (no fills/styles in the `d`). The LAST path renders in the
  accent color, the rest in ink. A malformed path is silently skipped, so keep them clean.
- **Pick a `motion`** (this is what makes it MOVE):
  - `spin` — rotates forever. For radial/circular things: sol, estrela, roda, selo, loading, planeta.
  - `pulse` — beats (scale + ). For heart/alert/notificação/"ama"/"urgente"/coração.
  - `trace` — re-draws the line forever. For caminho/jornada/rota/assinatura/sinal/gráfico vivo.
  - `float` — bobs + breathes gently (this is the icon default). For a calm object that should still breathe.
  - `draw` (omit `motion`) — draws on once then settles. For a logo/shape reveal that shouldn't loop.
- **SEMANTIC CHECK** (same as everywhere): the drawing must ENACT the meaning, not just decorate.
  "sem limite" = an open horizon line (trace), NOT a random icon. "explodiu" = rays bursting out (spin).

Authoring tips for clean paths:
- Star (5-point, vb 100): `M50 10 L59.4 37.1 L88 37.6 L65.2 54.9 L73.5 82.4 L50 66 L26.5 82.4 L34.8 54.9 L12 37.6 L40.6 37.1 Z`
- Heart (vb 100): `M50 80 C 18 56 16 28 38 24 C 47 22 50 32 50 36 C 50 32 53 22 62 24 C 84 28 82 56 50 80 Z`
- Upward route (vb 100): `M10 85 C 30 80 25 55 45 52 C 65 49 60 28 85 18`
- Mountain/peak (vb 100): `M10 80 L40 35 L55 55 L75 25 L92 80 Z`
Adapt these or write your own — they're starting points, not a fixed set.

## Composition (handled FOR you)
Every visual here is auto-centered + auto-scaled by Reel.tsx so the object + text read as one
composition with no dead gap. You only choose the visual + (for svg) the paths + motion + the text and
`place`. Don't hand-position anything.
