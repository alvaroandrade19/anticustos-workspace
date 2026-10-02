// Tempos do projeto foram escritos na narração v1 ("IAs").
// REMAP converte para a narração v2 ("inteligências artificiais"), palavra a palavra.
const REMAP: [number, number][] = [[0,0],[1.32,1.33],[2.32,2.47],[3.59,3.6],[4.68,4.7],[6.2,6.32],[7.33,7.5],[8.28,8.43],[9.32,9.4],[10.5,10.58],[12,12.02],[13.37,14.56],[14.22,15.26],[15.98,16.84],[17.33,17.85],[18.06,18.64],[19.19,20.06],[19.8,20.73],[20.5,21.68],[22,23.24],[23.51,24.34],[25.03,26.08],[25.69,26.57],[26.46,27.26],[27.53,28.33],[28.48,29.17],[29.81,31.21],[30.76,32.34],[31.84,33.5],[33.36,35.17],[34.64,36.29],[35.27,36.91],[36.8,38.27]];
// Respiros inseridos na narração v2 crua: [corte (s), pausa (s)] — cortes em silêncio real
export const PAUSES: [number, number][] = [[2.395,0.2],[6.008,0.35],[9.25,0.3],[10.413,0.25],[16.69,0.4],[20.567,0.25],[22.997,0.4],[24.025,0.25],[25.972,0.2],[26.537,0.2],[29.19,0.35],[32.21,0.3],[35.04,0.4]];
const remap = (x: number) => {
	if (x <= 0) return x;
	for (let i = 1; i < REMAP.length; i++) {
		const [a0, b0] = REMAP[i - 1];
		const [a1, b1] = REMAP[i];
		if (x <= a1) return b0 + ((x - a0) / (a1 - a0)) * (b1 - b0);
	}
	const [al, bl] = REMAP[REMAP.length - 1];
	return bl + (x - al);
};
/** tempo do roteiro (v1) → tempo final no vídeo */
export const rt = (old: number) => {
	const raw = remap(old);
	return raw + PAUSES.reduce((a, [c, s]) => a + (raw > c ? s : 0), 0);
};
