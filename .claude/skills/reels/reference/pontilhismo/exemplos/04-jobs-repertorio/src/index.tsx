import React from 'react';
import {AbsoluteFill, Audio, Composition, registerRoot, Sequence, staticFile} from 'remotion';
import {Chunks, OUT, sec} from './kit';
import {Background, END, Particles} from './Particles';
import {rt} from './time';
import TEXT from './text.json';

type TX = Record<string, {parts: [string, number][]; y: number; size: number; serif?: boolean}>;
const SC = Object.entries(TEXT as unknown as TX).map(([k, v]) => ({k: +k, ...v, t: rt(v.parts[0][1])}));

const Jobs: React.FC = () => (
	<AbsoluteFill style={{background: '#0A0A0A'}}>
		<Background />
		<Particles />
		{SC.map((s, i) => {
			const from = sec(s.t);
			const next = i + 1 < SC.length ? sec(SC[i + 1].t) : sec(END) + 999;
			const d = next - from;
			return (
				<Sequence key={s.k} from={from} durationInFrames={Math.min(d + OUT, sec(END) - from)}>
					<AbsoluteFill style={{textShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.8)'}}>
						<Chunks k={s.k} d={d} y={s.y} size={s.size} serif={s.serif} />
					</AbsoluteFill>
				</Sequence>
			);
		})}
		<Audio src={staticFile('narracao.mp3')} />
	</AbsoluteFill>
);

registerRoot(() => <Composition id="Jobs" component={Jobs} durationInFrames={sec(END)} fps={30} width={1080} height={1920} />);
