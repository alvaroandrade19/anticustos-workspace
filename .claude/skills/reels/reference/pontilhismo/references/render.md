# Render e entrega

## Render

```bash
npx remotion render Video out/video.mp4 --codec=h264 --crf=16 --muted
ffmpeg -y -i out/video.mp4 -i public/narracao.mp3 -filter_complex "[1]aresample=48000,loudnorm=I=-14:TP=-1.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k renders/video-final.mp4
```

- Renderize **mudo** e junte a narração com `loudnorm` a −14 LUFS (padrão de Reels/Shorts).
- 30 fps, 1080×1920. Um vídeo de ~45 s leva poucos minutos.
- Com Three.js no Windows, use `--gl=angle`.

## Windows: pastas com acento

O Chrome headless do Remotion falha ao abrir em caminhos com acento (ex.: `Conteúdos`). Soluções:

- Crie uma junção sem acento: `New-Item -ItemType Junction -Path D:\projetos-min -Target "D:\...\Conteúdos\..."` e renderize por ela, **ou**
- Passe o executável por um caminho sem acento: `--browser-executable="D:/projetos-min/.../chrome-headless-shell.exe"`.

## Economizando espaço

Vários vídeos podem compartilhar um único `node_modules` (junção/symlink para um projeto irmão) em vez de instalar tudo em cada pasta. Cuidado: apagar o projeto de origem quebra os que apontam para ele. Ao apagar uma pasta com junção, **remova a junção primeiro** (não apague o conteúdo do alvo).

## Entrega

- `renders/<nome>.mp4` — só narração, sem efeitos sonoros (salvo pedido).
- Liste os créditos das imagens (para a legenda do post).
- Não versione `node_modules`, `out/` nem narrações pessoais no Git.
