# engine-remotion.md — the primary render path (Remotion 4)

The premium engine is **Remotion** (React → headless Chrome → bundled ffmpeg → MP4). You do NOT
write React. You write the scene plan (`props.json`); the bundled generic component
(`assets/remotion/src/Reel.tsx`) renders it. The orchestration is the `scripts/render.mjs` script.

## How to render (one command)
```
node scripts/render.mjs --props "<plano.json>" --out "conteudo/reels/<slug>/<slug>.mp4"
```
The script:
1. Picks a **no-spaces temp dir** (project path "fabrica de ferramentas IA" has spaces, which
   breaks Chromium with "Multiple targets are not supported" — verified in this repo's history).
2. Copies the engine + the bundled Anton font into `public/` there, and the plan as `props.json`.
3. **Probes a system browser** (Edge, then Chrome) and passes `--browser-executable` so Remotion
   **skips the ~150–300MB Chrome Headless Shell download**. If none is found, Remotion downloads
   its own shell once.
4. `npm install` (first run only; deps are pinned exact, lockstep `@remotion/*` at 4.0.474).
5. `npx remotion render src/index.ts reel out/reel.mp4 --props=./props.json` — note `--props` is a
   **FILE**, never inline JSON (inline breaks on the Windows shell — verified in the Remotion docs).
6. Copies the finished MP4 back to `--out` (a path with spaces is fine for the copy).
7. Exits non-zero on any failure so the skill can fall back to ffmpeg.

## props.json schema (what you write)
Each scene picks an animated VISUAL + the on-screen line. The visual sits in the upper ~60%; the
text sits in the lower third (the engine separates them — never overlap). A top-level `theme`
colors everything; an optional `audio` adds a soundtrack.
```json
{
  "theme": "claude",
  "audio": "C:/caminho/voz.mp3",
  "scenes": [
    {"visual": "orb",       "text": "VOCÊ TEM\nUMA IDEIA", "big": true, "hold": 80},
    {"visual": "code",      "text": "você só descreve",   "hold": 78, "code": ["> criar app de", "  agendamento", "", "claude: feito ✓"]},
    {"visual": "wireframe", "text": "a IA monta\nA ESTRUTURA", "big": true, "hold": 84},
    {"visual": "chart",     "text": "e ela CRESCE",       "hold": 76, "points": [6,14,10,26,34,30,56,78,98]},
    {"visual": "counter",   "text": "mais rápido",        "hold": 74, "to": 10, "suffix": "x"},
    {"visual": "svg",       "text": "sem\nLIMITE", "big": true, "hold": 80, "paths": ["M58 8 L34 56 H53 L44 92 L72 42 H52 Z"], "viewBox": "0 0 100 100"},
    {"visual": "figures",   "text": "saia\nNA FRENTE",    "hold": 80},
    {"visual": "orb",       "text": "CLAUDE CODE", "sub": "você fala, ele constrói", "hold": 100}
  ],
  "perScene": 78
}
```

### Visuals (pick by MEANING — see fluxo.md's director table)
- **`orb`** — living glowing sphere (glow tinted by the theme accent + rings + particle halo).
  "AI / idea / energy / brand." Hook + CTA.
- **`code`** — terminal with code TYPING in. Pass `code` (array of short lines) — **write REAL
  lines about the topic** (the actual thing being built), not lorem. "Building / Claude."
- **`wireframe`** / **`network`** — line-art that DRAWS ITSELF on (monitor / node-graph). "Explainer."
- **`figures`** — running silhouettes + motion-blur. "People / momentum / get ahead."
- **`particles`** — depth starfield. "Infinite / space / calm." (Also the global ambient bed.)
- **`counter`** — a big number counting up. Fields: `to` (target), `suffix`/`prefix` (e.g. `"x"`,
  `"%"`, `"R$ "`), `decimals`. "Metric / scale / proof."
- **`chart`** — a draw-on rising line + area + tip dot. Field: `points` (array of numbers, the
  trend — make it END HIGH). "Growth / results."
- **`svg`** — BESPOKE: YOU author SVG path `d` strings for THIS topic (a bolt, a rocket, a brain,
  a globe, a key…) and the engine draws them on. Fields: `paths` (array of `d` strings),
  `viewBox` (default `"0 0 100 100"`). Keep 1-3 simple paths; the engine validates each (a broken
  path is silently skipped). Use SPARINGLY (1-2 beats) for the concept that has no built-in visual.
- **`grid`** — a 3D PERSPECTIVE FLOOR (Tron-style) receding to the horizon + a floating rotating
  3D polyhedron (the signature motif). Frame-filling depth. Great hook / "the world / the system".
- **`device`** — a 3D-TILTED MONITOR filling the frame, code typing on its screen, slow rotate.
  Pass `code` (lines). The premium "building it" hero shot.
- **`crowd`** — depth-stacked marching SILHOUETTES on the grid + a hero figure in front. "People /
  get ahead / não fique para trás." (Big, frame-filling, grounded with shadows.)
- `text` `\n` = break. `big` = larger + scale-punch + flash. `sub` = kicker. `hold` = frames.
  `place` = `"top"` or `"bottom"` (default) — put the BIG hero type at the top for `grid`/`crowd`
  scenes so it doesn't sit on the visual.

### Theme (colors)
`theme` is a named palette OR an object `{bg, ink, ink2, accent, mode}`:
- Named: `mono-dark` (default/signature), `mono-light` (white bg, dark ink), `editorial` (our
  DIFFERENTIATED flagship — off-white #f4f2ee bg + dark ink + indigo accent, the light premium
  look that doesn't copy the black-bg competitors), `editorial-lime`, `ink` (dark + indigo),
  `claude` (warm orange #d97757), `midnight`, `emerald`, `crimson`, `gold`, `violet`.
- **Prefer a DARK theme by default**: the light-on-black look reads far
  more premium/cinematic — glow, atmosphere and the orb only exist on a dark bg, so a white recolor
  always looks like "dark with the light off". Default to `mono-dark` or the topic/brand color
  (e.g. `claude`). Light themes still work but are NOT the default. (Differentiation from the
  black-bg competitor is an open item — solve it INSIDE dark: a signature color, less orb-cliché.)
- Object: `mode` is `"dark"` or `"light"` (light mode recolors specially — solid orb, dark grain,
  soft vignette). `accent` drives the orb glow, chart line, svg, sub-text. `ink` = primary
  text/lines, `ink2` = dim, `bg` = background.
- Pick the palette from the user's BRAND (marca/design-guide.md, tema `anticustos`), else the TOPIC
  (Claude/Anthropic → `claude`), else default `mono-dark`. Never invent a brand color.

### Audio (optional)
`audio` = a path to the user's audio file (mp3/m4a/wav). The render script copies it in, **plays
it under the video, and auto-scales the scenes so the reel length = the audio length** (beat-level
caption sync: each line shows over its slice). Without `audio`, duration = sum of holds.

Total duration is auto-computed. ONE visual idea per beat; CHANGE the visual when the line changes.

## Verified facts (don't regress these)
- Versions: remotion / @remotion/cli / react / react-dom pinned; never mix `@remotion/*` versions.
- Use the **brownfield 3-file scaffold** (`index.ts` registerRoot + `Root.tsx` `<Composition>` +
  `Reel.tsx`). There is **no `registerComposition` function**. `create-video` is interactive-only,
  so we don't use it.
- Remotion v4 **bundles ffmpeg** for the render — the system ffmpeg is NOT required by this path
  (it's only used by the fallback and by the quality-frame extraction).
- The component loads the font via `delayRender`/`continueRender` so the MP4 never shows a
  font-swap flash.
- Node 20+ on Windows: spawning `npm.cmd`/`npx.cmd` needs `shell:true`; the script already does
  this and quotes the Edge path (which lives under "Program Files", with a space).

## License (safe to sell — but disclose)
Remotion is free for individuals, non-profits, and for-profit orgs with **≤3 employees**. A solo
creator buying this skill and rendering their own videos pays Remotion nothing — the trigger is
ENTITY SIZE, not whether money changes hands or per-video. Two honest disclosures (put them in
LEIA-PRIMEIRO, not on screen): (1) Remotion uses a custom source-available license, not MIT;
(2) a buyer who is a for-profit company with 4+ employees needs their own remotion.pro license.

## If it fails
Common causes + what the script/skill already does:
- spaces in path → handled (temp dir).   - `--props` inline → handled (file).
- no system browser → Remotion downloads its shell (slower first run, still works).
- Node/npm absent → the script can't run at all → go to fallback-ffmpeg.md.
Surface the real error to the user in one PT-BR line, then offer the ffmpeg fallback.
