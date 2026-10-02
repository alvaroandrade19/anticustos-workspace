# O motor de partículas (World.tsx)

## Ideia

`N` pontos (5–6 mil) existem o vídeo inteiro. A cada momento, cada ponto `i` pergunta à forma atual onde deve estar: `[x, y, z, raio, opacidade]` no mundo 3D. Uma câmera projeta tudo na tela. Entre duas formas, cada ponto interpola com um atraso aleatório (`spread`) → morph orgânico.

## As três tabelas que você edita

```ts
// 1) FORMAS — uma função por ideia
const FORMAS = {
  retrato: (i, t) => [...],   // de data/retrato.json
  motor:   (i, t) => [...],   // objeto 3D paramétrico
};

// 2) CHAVES — sequência (tempo da fala → forma)
const CHAVES = [
  {t: 0,    f: 'retrato', dur: 0.6, spread: 0.25},
  {t: 6.08, f: 'motor',   dur: 0.6, spread: 0.3},
];

// 3) CAMERAS — poses no tempo (yaw, pitch, dist, x, y) com easing
const CAMERAS = [
  {t: 0,   c: {yaw: 0,    pitch: 0,   dist: 1500, x: 0, y: 0}},
  {t: 6.1, c: {yaw: -0.5, pitch: 0.3, dist: 1500, x: 0, y: 0}, d: 0.9},
];
```

## Receitas

- **Divida os pontos por partes** de um objeto (`i` em faixas): ex. motor = estator 0–1500, bobinas 1500–2500, rotor 2500–3700… Sobras viram `ambiente` (poeira quase invisível no espaço).
- **Estados animados dentro de uma forma**: parâmetros (explode, spin, rotorOut, skew, campo) calculados a partir de `t` — a forma se move sozinha enquanto a câmera trabalha.
- **Formas por amostragem de caminho** (livro, cabeça de perfil, balão): liste pontos do contorno e amostre uniformemente pelo comprimento.
- **Glifos** ("?", "!"): desenhe o caractere num canvas, amostre os pixels, extrude em 2–3 camadas em z e gire.
- **Rótulos 3D**: use `project()` com a mesma câmera para posicionar textos em SVG que acompanham a peça.
- **Opacidade por profundidade**: pontos distantes mais fracos (`ci(s, [0.25, 0.7], [0.35, 1])`).
- **Three.js** (`@remotion/three`) é opcional — útil para dezenas de milhares de pontos (galáxia de 60 mil, Terra com continentes). Um `ThreeCanvas` por cena, `PointsMaterial` com sprite radial e blending aditivo. Ver exemplo 03.

## Tempos

- Morph de entrada do protagonista: 0,5–0,6 s.
- Morph padrão: 0,6–0,9 s; frases curtas: 0,3–0,5 s.
- Câmera: 0,7–1,2 s por movimento; órbitas longas 1,6–2,2 s.
- Todos os tempos saem de `words.json` (início da palavra-gatilho).
