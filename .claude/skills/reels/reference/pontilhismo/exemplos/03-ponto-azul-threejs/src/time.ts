// Respiros inseridos na narração crua: [corte (s), pausa (s)] — cortes no ponto mais silencioso entre frases
export const PAUSES: [number, number][] = [[5.437,0.4],[8.243,0.25],[10.14,0.45],[11.455,0.35],[15.905,0.6],[20.32,0.3],[24.915,0.7],[26.42,0.35],[29.52,0.55],[34.768,0.2]];
/** tempo da narração crua → tempo final */
export const rt = (raw: number) => raw + PAUSES.reduce((a, [c, s]) => a + (raw > c ? s : 0), 0);
