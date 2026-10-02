// Respiros inseridos na narração crua: [corte (s), pausa (s)] — cortes no ponto mais silencioso entre frases
export const PAUSES: [number, number][] = [[2.7,0.2],[4.262,0.35],[7.7,0.4],[12.52,0.45],[13.73,0.25],[17.812,0.2],[22.2,0.6],[24.46,0.35],[26.44,0.25],[30.63,0.55],[33.828,0.35],[35.36,0.45],[38.323,0.25]];
/** tempo da narração crua → tempo final */
export const rt = (raw: number) => raw + PAUSES.reduce((a, [c, s]) => a + (raw > c ? s : 0), 0);
