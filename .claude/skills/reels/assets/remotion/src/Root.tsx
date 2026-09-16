import React from 'react';
import {Composition} from 'remotion';
import {Reel, reelDuration, ReelProps} from './Reel';

// Default scene plan — overridden at render time by --props=./props.json.
const defaultProps: ReelProps = {
  scenes: [
    {visual: 'orb', text: 'UMA\nIDEIA', big: true, hold: 70},
    {visual: 'code', text: 'um prompt', hold: 70},
    {visual: 'wireframe', text: 'a máquina\nCONSTRÓI', big: true, hold: 80},
    {visual: 'orb', text: 'pronto', sub: 'sem código', hold: 80},
  ],
  perScene: 75,
  theme: 'mono-dark',
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="reel"
      component={Reel}
      durationInFrames={reelDuration(defaultProps.scenes, defaultProps.perScene)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      calculateMetadata={({props}) => ({
        durationInFrames: reelDuration(props.scenes ?? [], props.perScene ?? 75, props.audioDurationInFrames),
      })}
    />
  );
};
