# fallback-ffmpeg.md — zero-install fallback (pure ffmpeg)

Use this when Node/npm is missing or the Remotion render fails. It needs ONLY ffmpeg (already on
the machine / covered by skill 03). The look is cleaner-but-simpler than Remotion (no word-by-word
stagger), still on-brand: black bg + glowing orb + Anton kinetic text + grain + vignette. You
(Claude) assemble the commands — no Node script runs here (that's the point: Node may be absent).

All commands below are VERIFIED on ffmpeg 8.1.1 (Windows) — they produced a real 1080x1920 MP4.

## Step 0 — work in a NO-SPACES temp dir, with the font copied in
The project path has spaces AND the drawtext `fontfile=` option hates spaces/colons. Dodge BOTH by
copying the bundled font to a no-spaces dir and referencing it **relatively**:
```
# Windows: use C:\reel-tmp ; Mac/Linux: use /tmp/reel-tmp
mkdir C:\reel-tmp   (or mkdir -p /tmp/reel-tmp)
copy "<skill>/assets/fonts/Anton-Regular.ttf"  C:\reel-tmp\Anton.ttf
# then run every ffmpeg command WITH cwd = that temp dir, and copy the final MP4 back to reels/<slug>/.
```

## Step 1 — render the orb once (a still PNG)
A soft Gaussian orb, centered horizontally, ~35% down. `geq` computes the falloff, `gblur` softens:
```
ffmpeg -y -f lavfi -i "color=black:s=1080x1920:d=1" \
 -vf "geq=r='235*exp(-((X-540)*(X-540)+(Y-672)*(Y-672))/(2*230*230))':g='235*exp(-((X-540)*(X-540)+(Y-672)*(Y-672))/(2*230*230))':b='235*exp(-((X-540)*(X-540)+(Y-672)*(Y-672))/(2*230*230))',gblur=sigma=42" \
 -frames:v 1 orb.png
```
(540,672) = center; 230 = orb radius (sigma). Bigger = bigger orb. Pre-rendering it once is far
faster than running geq per frame.

## Step 2 — build the filtergraph in a FILE (one drawtext per scene)
Write `filt.txt`. For EACH scene, one `drawtext` with: the bundled font (relative path), the line,
an `alpha` fade-in/hold/fade-out via nested `if()`, and `enable='between(t,start,end)'`. Then a
temporal `noise`, a `vignette`, and overall `fade` in/out. Template (3 scenes, 8s):
```
[0:v]format=yuv420p,
drawtext=fontfile=Anton.ttf:text='VOCÊ DESCREVE':fontcolor=0xf5f5f5:fontsize=100:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,0.4),0,if(lt(t,0.8),(t-0.4)/0.4,if(lt(t,2.6),1,if(lt(t,3.0),1-(t-2.6)/0.4,0))))':enable='between(t,0.4,3.0)',
drawtext=fontfile=Anton.ttf:text='A IA CONSTRÓI':fontcolor=0xf5f5f5:fontsize=112:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,3.4),0,if(lt(t,3.8),(t-3.4)/0.4,if(lt(t,5.0),1,if(lt(t,5.4),1-(t-5.0)/0.4,0))))':enable='between(t,3.4,5.4)',
drawtext=fontfile=Anton.ttf:text='CLAUDE CODE':fontcolor=0xf5f5f5:fontsize=96:x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,5.8),0,if(lt(t,6.2),(t-5.8)/0.4,if(lt(t,7.4),1,if(lt(t,7.8),1-(t-7.4)/0.4,0))))':enable='between(t,5.8,8.0)',
noise=alls=7:allf=t,
vignette=PI/5,
fade=t=in:st=0:d=0.5,
fade=t=out:st=7.5:d=0.5[v]
```
Notes: keep the line text UPPERCASE (Anton is an uppercase display face); `\n` multi-line needs a
separate drawtext per line (stack with different `y`). Commas inside the `alpha`/`enable`
expressions are safe because they're single-quoted. Pick the total duration = last scene end.

## Step 3 — encode (use the NON-deprecated filter-from-file form)
`-filter_complex_script` is **deprecated in ffmpeg 8.1** — use `-/filter_complex`:
```
ffmpeg -y -loop 1 -t 8 -i orb.png -/filter_complex filt.txt -map "[v]" \
  -r 30 -pix_fmt yuv420p -c:v libx264 fallback.mp4
```
Then copy `fallback.mp4` to `reels/<slug>/<slug>.mp4`.

## Limits vs the premium engine (be honest with the user)
- No per-word stagger / no spring easing — text fades in as a block, not word by word.
- One font weight, simpler composition. Still monochrome, still grain+vignette, still good.
- Tell the user this is the **lighter engine** and that installing Node (skill 03) unlocks the
  premium word-by-word version.

## Optional audio (only if asked; label it as placeholder)
A neutral ambient pad, NOT licensed music: `-f lavfi -i "sine=frequency=110:duration=8,volume=0.05"`
mixed in, or just leave it silent (default) and tell them to add a trending sound in the editor.
NEVER fetch or bundle copyrighted tracks.
