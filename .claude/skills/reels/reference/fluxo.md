# fluxo.md — the run order

## 0. Where things go
- Output: `conteudo/reels/<slug>/<slug>.mp4` (slug = kebab of the topic) + `conteudo/reels/<slug>/plano.json`
  (the scene plan you rendered, so a re-render is one command).
- The engine + font live inside the skill at `assets/`; the render script at `scripts/render.mjs`.

## 1. Intake (one short PT-BR exchange, no form)
- If the user gave a topic ("um reel sobre criar ferramentas com IA") → YOU write the lines.
- If the user gave the exact lines → respect them; only fix anti-slop tics (and say what you
  changed and why).
- Empty / vague → ask in one line: "Sobre o que é o vídeo? Me dá o tema ou a frase principal."
- Optional brand: `Glob` for `marca/design-guide.md` (a fonte de marca deste workspace) or ask if they
  have brand colors → use them as the `theme`. Default to `mono-dark` if nothing is given.
- Optional AUDIO: if the user has a voiceover/audio, take its path → `audio` in the plan. The
  reel length will match the audio and captions sync at the beat level (each line over its slice).
- Current-event topic → you MAY `WebSearch` to get the fact right, then verify date/source before
  putting any claim on screen. If web is down, keep the line evergreen.

## 2. Be the SCENE DIRECTOR (read estetica.md FIRST) — build the reel FOR this text
Don't slot copy into a fixed template. Read the script line by line and, for EACH beat, choose the
visual that MATCHES THE MEANING and author the SPECIFIC content for it. Aim for **8–12 beats** over
20–30s so it feels rich, and never repeat the same visual back-to-back.

**Pick the color theme FIRST** (`theme`): the user's brand (marca/design-guide.md, tema `anticustos`) → else
the topic (Claude/Anthropic → `claude` orange; finance → `emerald`/`gold`) → else **prefer a LIGHT
theme (`editorial`)** — that's our DIFFERENTIATION (competitors do black-bg/white; a light or
accent look never reads as a copy). `mono-dark` only if the user wants dark. Palettes in engine-remotion.md.

**Intent → visual (and what to author):**
| The line is about… | visual | author this specific content |
|---|---|---|
| **hero beat where real 3D depth matters** (hook or final CTA) | `hero3d` | (WebGL metallic sphere + orbital rings — use for the opening or closing when you want the 3D premium look; `place:"top"` works well) |
| idea / AI / energy / the brand / open & close | `orb` | (CSS gradient sphere — lighter, works everywhere) |
| the world / system / "where you are" / a strong hook | `grid` | (perspective floor + signature motif) |
| building / coding / "the AI does it" | `device` or `code` | REAL `code` lines about the topic |
| structure / how it works | `wireframe` / `network` | — |
| people / crowd / get ahead / stand out | `crowd` or `figures` | — (use `place:"top"` for the text) |
| growth / results / it scales | `chart` | `points` that END HIGH |
| a metric / number / proof | `counter` | `to` + `suffix` (`x`, `%`, `R$ `) |
| infinite / calm / space | `particles` | — |
| a concrete THING with no built-in (rocket, brain, globe, key) | `svg` | draw a SPATIAL METAPHOR of the concept — see rule below |

- `text`: the line. `\n` break. ≤9 words/line. `place:"top"` for `grid`/`crowd` (visual fills below).
- `big`: hook/payoff (bigger + scale-punch + flash). `sub`: kicker. `hold`: ~70–104.
- **FILL THE FRAME** (the pro look): favor the big frame-filling scenes (`grid`/`device`/`crowd`/
  `orb`) for hero beats — they have 3D depth and fill the screen, vs leaving empty space. Arc
  Hook→Escalation→Payoff→close; alternate calm (orb/particles/grid) and dense (device/code/crowd/
  chart). Use `svg` sparingly (1-2 beats). Duration auto-computed (or set by the audio length).

**SEMANTIC CHECK — mandatory before locking any scene:**
For every beat, ask: *"Does this visual ENACT the meaning of the line, or just vaguely associate with it?"*
A visual ENACTS when someone who can't read the text can still infer the concept from the visual alone.
- ✅ "sem limite" → `svg` drawing an open horizon (a line extending past the frame edge), or a ceiling/barrier with a break in it, or a path diverging to infinity → ENACTS "no ceiling"
- ❌ "sem limite" → `svg` lightning bolt → a bolt is power/speed, not "limitlessness" — reject
- ✅ "liberdade" → `svg` two chains separating OR a door opening (two L-shapes moving apart)
- ✅ "crescimento" → `chart` with points going steeply up → ENACTS growth
- ✅ "escala global" → `network` (nodes connecting across the frame) → ENACTS reach
- ❌ "you're building something" → `orb` → orb is AI/energy, not building — use `device` or `code`

**SVG semantic rule (when you reach `svg`):**
Describe the concept spatially: what does "X" look like as a line drawing? Reject any icon that could
belong to a different concept. Draw the THING or the ACTION:
- "crescimento" → an upward arrow or staircase path
- "conexão" → two dots with a line drawn between them  
- "velocidade" → diagonal slash lines with spacing (speed lines)
- "rompimento" → a straight horizontal line with a zig-break in the center
Keep paths simple (2–4 anchors each), valid SVG syntax, ≤1200 chars. Always validate: does this
path — if you saw it with no text — make you think of the concept? If not, rethink.

## 3. Approval gate (mandatory — never skip)
Show the plan as a clean numbered list in PT-BR — the line + (between paras) the visual/beat:
```
Roteiro do vídeo (~16s):
1. VOCÊ DESCREVE            (gancho · esfera de luz)
2. em português claro       (tela de código digitando)
3. a IA CONSTRÓI            (monitor se desenhando)
4. a ferramenta que você imaginou  (figuras correndo)
5. sem DIGITAR CÓDIGO       (virada · campo de partículas)
6. Claude Code — você fala, ele constrói   (fecho · esfera)
```
Then `AskUserQuestion`: **aprovar e renderizar / ajustar a copy / mudar o tom**. Render ONLY on
approval. If they ask to adjust, edit the plan and show it again.

## 4. Render
1. Write the approved plan to a temp `plano.json`.
2. Run the engine (see engine-remotion.md):
   `node scripts/render.mjs --props "<plano.json>" --out "conteudo/reels/<slug>/<slug>.mp4"`
3. Narrate in PT-BR: first run installs the video tools (1–2 min), then renders. Don't go silent.
4. On non-zero exit → ffmpeg fallback (fallback-ffmpeg.md). Say it's the lighter engine.

## 5. Look before delivering (quality gate)
Extract 2–3 frames and view them (SKILL.md §quality self-check). Verify against the estetica.md
premium checklist. Fix + re-render if a line overflows or a beat looks wrong.

## 6. Deliver (PT-BR, anti-guru)
- The MP4 path + duration.
- One "como postar" line: the video is silent on purpose — add a trending sound in the Reels/
  TikTok editor (helps reach). 
- Save `plano.json` next to the MP4 and offer a one-line re-render if they want a word changed
  ("muda só uma frase? eu re-renderizo rápido").
- If it is for a client with its own brand file, mention the look matches their identity/carrossel.
