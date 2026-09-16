# estetica.md — the premium minimalist look + anti-slop copy guard

Read this BEFORE writing any on-screen line or rendering. This is the moat: the difference
between a video that looks like a default AI template and one that looks like a designer made it.
Everything here draws on established references (kinetic-typography + Reels safe-zone guides, AI-slop
detection checklists, BR anti-slop lists) — sources noted inline.

## 1. The look in one paragraph
Pure black background. A single soft white orb that glows and breathes slowly. Heavy geometric
sans typography, white on black, UPPERCASE for the punch lines, revealed word by word. Subtle
film grain and a soft vignette so it never looks too clean. One thing moves at a time. That
restraint — not effects — is what reads as premium. (Restraint as the #1 premium-vs-amateur lever
is the most-cited finding across the motion-design sources.)

## 2. Typography tokens
- **ONE font: Anton** (bundled in `assets/fonts/Anton-Regular.ttf`, OFL). Heavy, condensed,
  geometric grotesque — exactly the genre's house look. NEVER Arial / Helvetica / Segoe / Inter
  for the headline (those are the #1 AI-tell font defaults).
- White-ish `#f5f5f5` (pure `#fff` can buzz on compression). Black `#000` bg.
- UPPERCASE for hook/payoff; tight tracking (`letter-spacing: -0.01em`); line-height ~1.02.
- Size: hook/payoff ~11.5% of width (≈124px at 1080w), normal beats ~8.2% (≈88px). Min legible
  on 9:16 is ~45px — never go under.
- Optional `sub` kicker: a SMALL light line under the headline (Arial/system, ~26% of the
  headline size, lower opacity ~0.72) — the only place a second, plain typeface is allowed.

## 3. Motion (the engine already encodes this — keep plans within it)
- Reveal = **opacity 0→1 + small upward translate (~26px→0)**, easing **ease-out cubic**, ~11
  frames. Words stagger by ~3 frames. Fade out over the last ~14 frames of the scene.
- The orb **breathes**: scale 0.97↔1.03 on a slow sine + a few px of vertical drift. It NEVER
  cycles color or strobes.
- FORBIDDEN motion: bounce, spin, fly-in-from-side, letter wobble, typewriter, star wipes,
  parallax zoom on text. One element animates at a time.

## 4. Composition & safe zones (1080x1920)
- Safe margins: top ~108px, **bottom ~280–320px** (caption + audio title sit here on IG/TikTok),
  left ~60px, right ~90–120px (the like/comment/share buttons). The engine pads text into the
  lower-center and keeps a ~360px bottom gutter — stay inside it.
- Headline lives center / lower-center; the orb sits upper-center (~35% height) so text emerges
  from its glow.
- A CTA, if any, goes upper-middle — **never at the very bottom** (it gets covered by UI).

## 5. Pacing & structure
- **Hook fully on screen by ~2.5–3s.** 50–60% of drop-off happens in the first 3s (OpusClip /
  retention data) — the first line must land immediately and be the most interesting one.
- Hold ~1.2–1.8s per line (≈ `hold` of 60–96 frames at 30fps); reading ≈ 4–6 words/sec.
- New beat every 1.5–3s. Arc: **Hook → Escalation → Payoff → close/CTA.** 5–7 scenes, ~15–22s total.
- ≤10 words on screen at once; 5–9 words per line; never a full sentence.

## 6. The orb / visual language
- Layered radial gradient: a wide soft halo + a brighter small core, both blurred. Slow breathe.
- Monochrome only. If a `brand.md` accent color exists you MAY tint the orb VERY subtly, but the
  default and strongest look is pure white-on-black. (Most orb tutorials default to rainbow
  color-cycling — we deliberately reject that; deduction flagged in research, not a citation.)
- Grain ~10% + soft vignette: sourced as one of the highest-leverage fixes for the "too clean =
  AI" tell (grain cited as cutting AI-detection meaningfully). Keep it subtle, not noisy.

## 6b. Animated scene archetypes (the engine encodes these; YOU pick per beat)
The video is NOT one static look — each beat gets a distinct ANIMATED visual that changes with
the copy. The engine implements them (research: Remotion motion-graphics + SVG/kinetic guides);
your job is to ASSIGN the right one per line:
- **orb** — living glowing sphere: layered-blur glow, slow breath, orbiting rings, particle halo.
  "AI / idea / energy." Use for the hook and the CTA.
- **code** — stylized terminal with code typing in (blink cursor, soft screen glow). "Building /
  Claude working." Theme it via a short `code` line array.
- **wireframe** / **network** — line-art (a monitor, a node graph) that DRAWS ITSELF on stroke by
  stroke, then breathes. The "explainer / it builds" beat.
- **figures** — abstract running silhouettes crossing with motion-blur + speed streaks. "People /
  momentum / get ahead."
- **particles** — depth starfield drifting with parallax (also the global ambient bed). "Infinite
  / space / calm."
ANTI-CHEESE rules the engine follows (keep your plan within them): always ease (expo-out / spring,
never linear pops); every element has subtle continuous secondary motion (breathe/drift/parallax);
3+ depth planes; glow via layered blur (not a flat bright circle); persistent grain + vignette +
slow camera on every scene; ONE visual idea per beat; the visual sits UPPER, text LOWER — never
overlapping. Forbidden: bounce/spin/fly-in, rainbow color, star wipes, everything popping at once.

## 7. Anti-slop COPY guard (PT-BR) — the lines must not smell like AI
The on-screen text is the product as much as the visuals. Ban these:
- **AI vícios (cited, Envox-style lists):** incrível, fascinante, essencial, revolucionário,
  "Não é apenas X, é Y", connector spam (além disso, ademais, portanto piling up), arbitrary
  travessões/em-dashes, hollow metaphors ("um mar de possibilidades"), "no mundo de hoje".
- **Genre clichés of the tech-motivational reel (avoid as empty filler):** "o futuro é agora",
  "à frente da multidão", "pare de ser comum", "a era da IA chegou", "não fique para trás",
  "isso vai mudar tudo". (Genre knowledge, not a cited list — use judgment; a sharp concrete line
  beats a grand vague one.)
- **No income/guru hype:** no "ganhe R$X", no "fature", no "em X dias", no promised outcomes, no
  "segredo que ninguém te conta". This is a hard pack rule.
- **Avoid a lone one-letter word ("O", "A", "É"...) as the FIRST word of a line.** At tight Anton
  tracking it can visually fuse with the next word's first letter (a standalone "O" before a word
  starting with "C" rendered as a fake "Q" in testing — cost a full render cycle to catch). Rewrite
  the line so it doesn't open on a bare single letter, instead of relying on the frame-check to spot it.
- **Write concrete, not grand.** "você descreve / a IA constrói / sem digitar código" beats
  "transforme sua realidade com o poder infinito da inteligência artificial". Short verbs,
  specific nouns, one idea per beat.

## 8. The premium checklist (all must be true before delivering)
1. Headline is Anton, not a system font.   2. Monochrome (no stray color).
3. ≤10 words per screen, ≤9 per line, no overflow past safe margins.
4. Word-by-word reveal, ease-out, no bounce/spin.   5. Orb present, breathing, not strobing.
6. Subtle grain + vignette (not a sterile flat black).   7. Hook lands by ~2.5s.
8. Copy has zero banned phrases and zero income/guru hype.   9. Clear arc with a payoff.
10. You actually LOOKED at 2–3 rendered frames and they match this list.
