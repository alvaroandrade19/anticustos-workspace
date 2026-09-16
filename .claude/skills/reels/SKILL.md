---
name: reels
description: >-
  Cria um vídeo minimalista preto e branco no estilo cinematográfico (fundo preto, uma esfera de
  luz que pulsa, texto grande aparecendo palavra por palavra) pra Reels, TikTok e Shorts — a
  partir de UMA frase sobre o tema. Use quando a pessoa quiser criar um reel, fazer um vídeo
  minimalista, montar um vídeo pro TikTok ou Shorts, transformar uma frase num vídeo, criar um
  vídeo com IA, ou um vídeo de texto animado no estilo "frase de impacto na tela preta". Mostra o
  roteiro (as frases que vão aparecer) pra você aprovar ANTES de renderizar, e entrega um MP4
  vertical 1080x1920 pronto pra postar. Gatilhos: "cria um reel", "faz um vídeo minimalista",
  "vídeo pro tiktok", "vídeo pro shorts", "transforma essa frase num vídeo", "vídeo de texto na
  tela preta", "vídeo com aquela bolinha de luz", "reel sobre". NÃO é pra gerar imagem/arte parada
  (isso é a /briefing-de-imagem) nem carrossel de fotos (isso é a /carrossel).
argument-hint: "[o tema ou a frase do vídeo — ex: 'um reel sobre criar ferramentas com IA']"
allowed-tools: Read, Write, Edit, Glob, Bash, AskUserQuestion, WebSearch, WebFetch
effort: high
model: inherit
---

# Reels (vídeo minimalista P&B a partir de 1 frase)

## Anti Custos: o que muda neste workspace (esta seção vence o resto do arquivo)
Skill genérica adaptada em 14/09/2026. Onde o texto abaixo discordar do restante, o abaixo manda.

1. **Travessão é proibido**, regra dura do workspace (`AGENTS.md`). Vale em TUDO: linha na tela,
   legenda, plano de cenas e o que você escreve no chat. Vírgula, dois-pontos, parênteses ou frase
   curta no lugar. O `reference/estetica.md` já bane travessão na copy de tela; aqui vale pro resto.
2. **Marca:** a fonte é `marca/design-guide.md`, não um `brand.md` (que não existe aqui). O tema
   padrão é **`anticustos`** (fundo `#05060A`, texto `#F2F4F8`, acento `#2563EB`), e o claro é
   `anticustos-claro`. Só sair dele se o Alvaro pedir outro tema por nome.
3. **Tipografia:** Anton continua na headline, decisão consciente. O design guide pede Schibsted
   Grotesk, e a exceção existe porque tipografia cinética pede peso condensado. Cor e medida vêm do
   guia; só a face da headline é exceção, como já acontece no carrossel.
4. **Pastas, seguindo o ciclo de vida das peças:**
   - produção: `conteudo/reels/<slug>/` com `<slug>.mp4`, `plano.json` e `legenda.md`
   - áudio de entrada: `dados/audio/` (criar se não existir)
   - agendado e publicado: **não mover à mão.** Quem move é `/publicar-social-ratos`
5. **Publicação:** o Instagram publica Reels por API. Depois de aprovar o vídeo, escrever a
   `legenda.md` na pasta da peça e oferecer o agendamento:
   `node .claude/skills/publicar-social-ratos/scripts/agendar.js --video "conteudo/reels/<slug>/<slug>.mp4" --quando "AAAA-MM-DD HH:MM"`
   (`--quando` também aceita relativo: `+30min`, `+2h`, `+1d`. Pra publicar na hora, é o
   `publish-graph-api.js --video ...` em vez do agendar.) Isso move a pasta pra
   `conteudo/agendado/instagram/` e grava o `_estado.md` sozinho.
6. **ffmpeg** está instalado (9.0.1, via winget, no PATH do usuário). O autocheck de frames e o
   fallback funcionam. Num shell aberto antes de 14/09/2026 o PATH pode estar velho: nesse caso use
   `C:\Users\aandr\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe`.
7. **O motor do Remotion é persistente**, fica em `%LOCALAPPDATA%\reel-engine`. Instala na primeira
   vez e reaproveita depois. Pra liberar disco: `node scripts/render.mjs --limpar`.

You turn ONE prompt (a topic or a single line) into a premium minimalist black-and-white
motion video — black background, a soft glowing orb, heavy kinetic typography revealed word
by word — vertical 1080x1920 MP4 for Reels/TikTok/Shorts. The LOOK is the product: it must be
restrained and premium, never templated AI-slop. Everything the user sees is **Brazilian
Portuguese, direct, anti-guru**: no time-to-money, no income promises, no hype, R$ never a bare
`$`. Your internal reasoning stays in English.

This file is the orchestrator. Read each reference file WHEN you reach the step that needs it
(progressive disclosure — do NOT read them all up front):
- `reference/fluxo.md` — the run order: intake → scene plan → approval gate → render → deliver.
- `reference/estetica.md` — THE MOAT: the premium look recipe + anti-slop copy guard (read before writing any on-screen line).
- `reference/engine-remotion.md` — the primary render path: props schema, the render script, the verified Windows landmines.
- `reference/transcricao.md` — audio → VERBATIM captions: the transcribe script, grouping the exact words into slides, the correction gate. Read when the user wants captions from their audio.
- `reference/biblioteca-movimento.md` — the MOVING-object catalog (the continuously-animated heroes) + the lever to INVENT a new moving visual (bespoke `svg` + `motion`). Read before choosing objects.
- `reference/biblioteca-icones.md` — the 5093-icon library (the `icon` visual): how to pick by meaning, the no-repeat rule, the curated PT palette. Read before choosing objects.
- `reference/fallback-ffmpeg.md` — the zero-install fallback when Node/npm is missing.

## Non-negotiable rules (read before anything)
1. **Copy-first, approve before render.** ALWAYS show the scene plan (the exact lines + the beat
   order) in PT-BR and get a yes BEFORE rendering. Rendering burns a minute; a wrong line wastes
   it. Never render unseen copy.
2. **The look is premium or it's nothing.** Obey `reference/estetica.md`: ONE heavy font, white
   on black, ≤10 words on screen, word-by-word reveal with ease-out (NEVER bounce/spin/fly-in),
   the breathing orb, grain + vignette. Name the generic default and forbid it (see §Forbidden).
3. **Anti-slop copy.** The on-screen lines must read like a sharp human wrote them. Ban the AI
   tics and the genre clichés listed in `reference/estetica.md`. No income/guru promises.
4. **Honesty about the method.** You make videos in THIS minimalist style. Do NOT claim you
   replicate any specific creator's exact tool — you own the look, not the person.
5. **Never hard-fail.** If the premium engine (Remotion) can't run, fall back to the ffmpeg path
   and SAY which engine produced the file. If nothing can render, deliver the scene plan + the
   exact command so the user can render later. Always leave them with something.
6. **Zero API key, no paid service.** Everything renders locally. Music is never fetched/bundled
   (license risk) — see §Audio.
7. **Audio captions are VERBATIM.** When the user gives an audio to caption, the on-screen text is
   EXACTLY what they said — transcribed locally (`scripts/transcribe.mjs`), never paraphrased, never
   summarized, never with words dropped or added. Group the exact words into slides; do NOT reword
   them. Show the transcript so the user can fix any mis-heard word BEFORE rendering. See §Audio.

## Forbidden (the generic-default blacklist for this output)
Reject these the moment they appear — they are what "default AI video" looks like:
- centered Arial/Helvetica/Segoe/Inter as the title font → use the bundled **Anton** always.
- more than one typeface for the headline; drop shadows as a crutch; outlines/strokes on text.
- rainbow / many clashing colors → the reel uses ONE theme (bg + ink + a single accent); color is
  fine (orange, a brand color, light mode), but stay inside the chosen theme — never a multicolor mess.
- bouncy/spinny/fly-in-from-the-side text; letters that wobble; star-wipe transitions.
- more than ~10 words on screen at once; full sentences; tiny text.
- the orb cycling colors or strobing → it glows the ONE theme accent and **breathes slowly**.
- a perfectly clean image with no grain (reads as fake/AI) → keep the subtle grain + vignette.

## Where the scripts/assets live + the FOLDER CONVENTION (IMPORTANT for running)
The working directory at runtime is the USER'S project, not this skill folder. So always call the
bundled scripts by the ABSOLUTE path to THIS skill's directory (the folder holding this SKILL.md),
not a bare relative path. E.g. on Windows: `node "C:\Users\<nome>\.claude\skills\reels\scripts\render.mjs" ...`
(same for `transcribe.mjs` / `group-captions.mjs`). Resolve the skill dir once at the start and reuse it.

**Standard folders in the USER's project (create them if missing, at the start of any run, and tell the
user once):**
- **`dados/audio/`** — where the user drops audio files to caption. ALWAYS look here first for an
  audio; if it's empty and the user mentioned audio, ask for the path.
- **`conteudo/reels/<slug>/`** — the piece's folder: `<slug>.mp4`, `plano.json`, `legenda.md`. This is
  the production state; `/publicar-social-ratos` moves the whole folder to `conteudo/agendado/instagram/`
  when it goes into the queue. Never write into `conteudo/agendado/` or `conteudo/publicado/` yourself.
Intermediate JSON (words/captions) goes in the piece folder or a temp path, never inside the skill folder.

## The run (detailed in reference/fluxo.md)
1. **Intake.** Get the topic/idea. If it's a bare topic, you write the lines; if the user gave
   exact lines, respect them (only fix anti-slop tics, and flag the change). Read
   `marca/design-guide.md` for the brand tokens; in this workspace the default theme is
   `anticustos`, not monochrome. If the user references a current event, you MAY
   WebSearch to get it right, then check the date/source before putting a claim on screen.
2. **Direct the reel FOR this text** (read `reference/estetica.md` + `reference/fluxo.md` §2). You
   are the scene DIRECTOR, not a template-filler. First pick a color `theme` — here it is
   **`anticustos` by default** (the brand's dark base + blue accent), unless the Alvaro names another. The dark,
   light-on-black look reads far more premium/cinematic for this style —
   the glow/atmosphere/orb only exist on a dark bg. Light themes (`editorial`) exist but are NOT the
   default look anymore. Then read the script line by line and, per beat, choose the visual that
   MATCHES THE MEANING and author the SPECIFIC content. **Pick in this order (read
   `reference/biblioteca-movimento.md` for the full catalog):**
   (a) **A moving HERO that ENACTS the line** — these animate the WHOLE scene (premium, first choice):
   `waveform` (voz/áudio), `orbit` (sistema/conectado), `ripple` (alcance/viraliza), `rocket`
   (lançar/decolar), `gears` (automação), `pipeline` (transforma X→Y/processo), `radar`
   (busca/encontra), `constellation` (rede/comunidade), `brain` (IA/pensar), `burst` (ideia/insight),
   `funnel` (funil/converte), `coins` (dinheiro/faturamento — metáfora, NUNCA promessa de renda),
   `checklist` (passo a passo/método), `globe` (global/mundo), `magnet` (atrai/clientes),
   `hourglass` (tempo/rápido), `lock` (destrava/acesso), `typing` (escrever/criar), `chart`
   (crescimento — `points`), `counter` (`to`+`suffix`), `figures` (correr), `orb`/`hero3d` (a marca),
   and the frame-filling 3D heroes `grid` (chão/mundo), `device` (monitor 3D — write REAL `code`),
   `crowd` (multidão — `place:"top"`), `wireframe`/`network` (estrutura). **Real-object heroes (highest
   impact — a viewer names the thing instantly):** `lightbulb` (ideia — preferir a `burst`), `shield`
   (segurança/sem risco), `trophy` (vitória), `phone` (no celular/post), `target` (meta/foco), `plant`
   (crescer do zero), `megaphone` (divulga), `bell` (notificação/engajamento), `key` (a chave/acesso),
   `gift` (bônus). PREFER a recognizable real object over the abstract clusters (`brain`/`burst`/
   `constellation`/`particles` — only for genuinely abstract lines).
   (b) **`object` = 50 ready premium real objects by NAME** (`{"visual":"object","name":"rocket"}`) —
   bold + glow + a fitting motion already assigned (rocket rises, bell swings, heart pulses, star spins).
   The easy breadth tier; full list in `reference/biblioteca-movimento.md`. For anything not in the 50,
   **`icon` = THE 5093-Tabler tool** (pick by MEANING, inline the paths — `reference/biblioteca-icones.md`;
   icons now FLOAT + breathe).
   (c) **Nothing fits? INVENT one** — author a bespoke `svg` (path `d` strings = a spatial metaphor)
   AND give it a `motion`: `spin` (sol/estrela/roda), `pulse` (coração/alerta/"ama"), `trace`
   (caminho/jornada/sinal vivo), `float` (objeto calmo respirando), or omit for `draw` (reveal once).
   This makes the library effectively infinite — YOU draw it, the engine animates it.
   **HYBRID:** open/punctuate with the brand/atmosphere heroes (orb / hero3d / grid / device / crowd),
   carry variety with the topical moving heroes + icons + bespoke svg in between.
   **SEMANTIC CHECK:** for every beat, ask "does this visual ENACT the meaning, or just loosely
   associate?" See `reference/fluxo.md` §2 for the full check + examples.
   **FILL THE FRAME** — favor the big depth scenes for hero beats, don't leave empty space. Aim for
   **8–12 beats**, alternate calm/dense, and **NEVER repeat an object in the same reel** (not the same
   icon, not the same hero — each beat is a distinct object; this was the #1 complaint). Each scene: a line
   (`\n` break, ≤9 words/line, `big:true` for hook/payoff, `place` top/bottom), optional `sub`,
   `hold` (~70–104). Full catalog + schema in `reference/engine-remotion.md` + `reference/fluxo.md`.
   **`hero3d`** = WebGL 3D sphere via Three.js (metallic + orbital rings). Use for hook/CTA hero
   beats when the reel needs true 3D depth (vs `orb` which is CSS gradient). Works with all themes.
   Total ~20–30s (or the audio length).
3. **Approval gate.** Show the plan as a numbered list of the lines (PT-BR) + total seconds. Use
   AskUserQuestion: aprovar / ajustar a copy / mudar o tom. Do NOT render until approved.
4. **Render.** Write the approved plan to `conteudo/reels/<slug>/plano.json` and follow
   `reference/engine-remotion.md`: run
   `scripts/render.mjs --props conteudo/reels/<slug>/plano.json --out conteudo/reels/<slug>/<slug>.mp4`.
   It installs Remotion into the persistent engine dir on the FIRST run only, reuses the system
   Edge/Chrome, keeps the engine outside the spaces-in-path project, and copies the MP4 back.
   Narrate progress in PT-BR ("montando o vídeo, primeira vez instala as ferramentas...").
5. **If render fails or Node is absent** → `reference/fallback-ffmpeg.md` (pure ffmpeg, already on
   the machine). Same scene plan, simpler motion. Tell the user it's the lighter engine.
6. **Deliver.** Give the MP4 path + a one-line "como postar" note (see §Audio) + the scene plan
   saved next to it. Offer one quick re-render if they want a line changed (re-render is cheap).
7. **Publish (this workspace).** Write the caption to `conteudo/reels/<slug>/legenda.md` following
   the voice rules, then offer to schedule it on Instagram:
   `node .claude/skills/publicar-social-ratos/scripts/agendar.js --video "conteudo/reels/<slug>/<slug>.mp4" --quando "AAAA-MM-DD HH:MM"`
   (`--quando` also takes `+30min`, `+2h`, `+1d`; to publish right now use `publish-graph-api.js
   --video ...` instead). That script moves the piece folder into
   `conteudo/agendado/instagram/` and writes `_estado.md`. Never move those folders by hand.

## Audio → caption (read `reference/transcricao.md` for the full how-to)
- **The user drops an audio and wants the captions to BE that audio** (the main path) → transcribe it
  locally and put the EXACT words on screen, well paced. Steps:
  1. **Find the audio in `dados/audio/`** (the convention here). If empty, ask for the path. Create
     `dados/audio/` if missing so the user has a place to drop files.
  2. **Transcribe:** `node "<skill>/scripts/transcribe.mjs" --audio "<file>" --out "<tmp>/words.json"`.
     First run installs the engine (~1–2 min) + model (~150MB), then offline/cached. Needs Node + ffmpeg
     (already on the machine). Narrate the wait in PT-BR.
  3. **Pace the slides DETERMINISTICALLY — do NOT eyeball this** (flashing slides was the #1 complaint,
     twice): `node "<skill>/scripts/group-captions.mjs" --words "<tmp>/words.json" --out "<tmp>/captions.json"`.
     It groups the EXACT words into slides that each stay on screen long enough to READ (~1.9s floor)
     without dragging, synced to the speech. Output: `{slides:[{text,hold}], audioDurationInFrames, fullText}`.
  4. **Build the plan from the slides AS-IS:** one scene per slide using its `text` + `hold` UNCHANGED
     (verbatim words, already paced). Just add a `visual` per slide by MEANING (object/hero/icon) and
     pick the theme; put the audio path in `audio`. Do NOT re-group, re-time, paraphrase, drop, or add a
     word — the script already handled grouping + timing.
  5. **Approval gate = the guarantee.** Show `fullText` + the slide breakdown (PT-BR) and ask the user to
     confirm or fix any MIS-HEARD word (whisper heard "Cloud" for "Claude"). Apply ONLY their corrections
     of transcription errors; never reword. Then render to `reels/<slug>.mp4`.
  - If the user wants more/fewer slides after seeing them, re-run group-captions with `--min`/`--max`
    (higher `--min` = fewer, calmer slides; lower = more). Don't hand-edit the grouping.
  - Degraded: no Node/transcription fails → say so honestly and offer to caption from lines the user
    types instead (don't silently fall back to paraphrase).
- **The user has audio but wants you to WRITE fresh lines** (not caption the speech) → write the lines,
  audio plays under, the reel fits the audio length, captions at the beat level. Make clear which it is.
- **No audio** → the video ships **SILENT by default** (no zero-license music to bundle; fetching
  copyrighted tracks is a real legal risk). Tell the user, in PT-BR, to add a trending sound INSIDE
  the Reels/TikTok editor (it also helps reach). Never present any synthesized tone as licensed music.

## Quality self-check before delivering (look, don't assume)
After rendering, extract 2–3 frames with ffmpeg (`select=eq(n\,<frame>)`) and LOOK at them. Check
against `reference/estetica.md`: is the headline Anton (not Arial)? colors within the chosen theme
(accent reads, good contrast)? does any line overflow the safe margins? is the orb breathing, not
strobing? did each beat get a visual that FITS its line (chart for growth, code for building)? If a line
overflows or a beat looks off, fix the plan and re-render before handing it over. Never deliver a
video you haven't looked at.

## Degraded mode
- **No Node/npm** → ffmpeg fallback. **No ffmpeg either** → deliver the scene plan + the exact
  render command + a one-line "instala o Node (a skill 03 Preparador de Máquina faz isso)".
- **WebSearch down** (only matters for a current-event topic) → say you couldn't verify the fact
  and keep the line evergreen instead of stating an unverified claim.
- **Spaces in the project path** → already handled by the render script (no-space temp dir).

## Edge cases
- Empty prompt → ask for the topic in one PT-BR line; don't invent a random theme.
- Very long line → split or shorten to fit ≤9 words/line and the 9:16 safe area; tell the user.
- Non-tech niche (padaria, advogado) → the orb/minimalist look still works, but adapt the COPY to
  the niche; don't force tech-bro phrasing onto a bakery.
- Abuse (hateful/illegal/defamatory text on screen) → refuse in PT-BR, offer a clean alternative.
- Other aspect ratios (1:1, 16:9) → v1 is built for 9:16 vertical; if asked, deliver 9:16 and say
  the square/landscape variants aren't in this version yet.
