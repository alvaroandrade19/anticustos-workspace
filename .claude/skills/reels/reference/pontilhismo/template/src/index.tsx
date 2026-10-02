import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {BG, ci, FPS, H, W} from './kit';
import {END, World} from './World';
import {Legenda} from './Legenda';

// ═══════════ COMPOSIÇÃO ═══════════
// Camadas (de baixo para cima): fundo → mundo de pontos → obras/fotos → rótulos/UI → legenda.
// Áudio: descomente <Audio> quando public/narracao.mp3 existir.
// import {Audio, staticFile} from 'remotion';
// import {Obra} from './Obra';

const Video: React.FC = () => (
	<AbsoluteFill style={{background: BG}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 46%, rgba(237,235,230,0.06) 0%, transparent 70%)'}} />
		<World />
		{/* <Obra a={3} b={5} src="img/obra.jpg" rect={[80, 520, 920, 700]} titulo="Título da obra" credito="AUTOR · ANO · ACERVO" /> */}
		<Legenda fim={END} />
		<AbsoluteFill style={{background: BG, opacity: ci(useCurrentFrame() / FPS, [END - 0.8, END], [0, 1])}} />
		{/* <Audio src={staticFile('narracao.mp3')} /> */}
	</AbsoluteFill>
);

registerRoot(() => <Composition id="Video" component={Video} durationInFrames={Math.ceil(END * FPS)} fps={FPS} width={W} height={H} />);
