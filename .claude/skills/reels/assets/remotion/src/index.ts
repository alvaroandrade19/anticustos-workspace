import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

// The render entry point. `npx remotion render src/index.ts reel out/reel.mp4`
registerRoot(RemotionRoot);
