import React from 'react';
import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';

// Plano padrão só pro Studio. No render o plano chega RESOLVIDO por scripts/plano.mjs
// (via --props=./props.json), com `from`/`dur` de cada cena e `totalFrames`.
const defaultProps: ReelProps = {
  modo: 'texto',
  theme: 'anticustos',
  totalFrames: 150,
  cenas: [
    {visual: 'orb', text: 'UMA\nIDEIA', big: true, from: 0, dur: 70},
    {visual: 'tipografica', text: 'O *CORTE*\nÉ A REVELAÇÃO', from: 70, dur: 80, entrada: 'corte'},
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="reel"
      component={Reel}
      durationInFrames={defaultProps.totalFrames}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.max(30, props.totalFrames ?? 150)})}
    />
  );
};
