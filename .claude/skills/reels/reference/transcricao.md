# transcricao.md — legenda VERBATIM a partir do áudio (Whisper local, sem chave de API)

The user records audio and wants the captions to BE that audio — word for word, nothing invented,
nothing cut. This is how. The words stay EXACT; you only decide how to group them into slides and
which visual fits each slide's meaning.

## The script
```
node <skill-dir>/scripts/transcribe.mjs --audio "<audio file>" --out "<words.json>" [--model <id>]
```
- Decodes the audio with ffmpeg (already on the machine), transcribes locally with Whisper via
  `@huggingface/transformers` — **no API key, offline after the first download**.
- First run installs the engine (~1–2 min) + downloads the model (~150MB, default `Xenova/whisper-base`).
  Both are cached in a persistent dir, so later runs are fast. Narrate this wait in PT-BR.
- Output JSON: `{ "text": "...", "words": [{"word","start","end"}, ...], "duration": <seconds> }`.
- Tougher/longer audio or accents: pass `--model Xenova/whisper-small` (bigger + slower, more accurate).

## Pace the slides with the SCRIPT (deterministic — don't eyeball it)
Splitting the transcript into slides BY HAND led to flashing slides (some gone before they can be read)
— reported twice. So a script does it, guaranteeing a readable floor per slide:
```
node <skill-dir>/scripts/group-captions.mjs --words "<words.json>" --out "<captions.json>"
    [--min 1.9] [--max 3.4] [--maxwords 9]
```
- It takes the words IN ORDER (never drops/reorders/adds/rewords), groups them into slides where each
  one **stays on screen ≥ ~1.9s** (readable) and **≤ ~3.4s** (doesn't drag), preferring natural
  sentence-ends and speech pauses as boundaries, and **merges any too-short slide into a neighbor** so
  nothing flashes. It also tidies mechanical splits (`"100"`+`"%"` → `100%`).
- Output `captions.json`: `{ slides:[{text, hold, seconds}], audioSeconds, audioDurationInFrames, fullText }`.
  `text` is UPPERCASE with `\n` line breaks (≤ ~4 words/line, ≤ 3 lines); `hold` is frames at 30fps.
- **Want a different rhythm?** Re-run with a higher `--min` (fewer, calmer slides) or lower (more,
  snappier). NEVER hand-edit the grouping — re-run the script so timing stays synced.
- Example (the 17.8s test narration → 5 readable slides): `3.6s, 3.7s, 3.8s, 2.6s, 4.1s`.

## Build the plan from the slides
1. One scene per slide. Use its `text` and `hold` EXACTLY as the script produced them — already verbatim
   and already paced. Set `audio` to the audio path; the engine fits the reel to the audio length.
2. **Visual per slide** = chosen by MEANING as always (object/hero/icon). The words are fixed; the
   picture is your call. Don't let the visual change the text.
3. Never re-group, re-time, or reword. If the rhythm's off, re-run group-captions (step above), don't tweak by hand.

## The approval gate IS the guarantee
Whisper is ~95% accurate in PT. It WILL occasionally mis-hear a word — names and foreign words most of
all (it heard "Claude" as "Cloud" in testing). So:
- Show the grouped transcript in PT-BR, slide by slide, and ask the user to **confirm or fix any
  mis-heard word** before rendering (AskUserQuestion: "tá certo assim / quero corrigir uma palavra").
- Apply ONLY the user's corrections of transcription errors. Never paraphrase, shorten, or "improve"
  their words — that's the whole promise.

## Degraded modes (be honest, never silently paraphrase)
- **No Node / install fails / transcription errors** → say so plainly and offer to caption from lines
  the user types instead. Do NOT fall back to writing your own paraphrase of the audio.
- **No ffmpeg** → can't decode; tell the user (the skill 03 Setup can help), keep the audio as
  background-only with lines they type.
- **Very noisy audio** → transcript may be rough; lean harder on the correction gate, suggest
  `--model Xenova/whisper-small`.
