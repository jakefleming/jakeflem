// Entry point for the web build: registers the <character-rig> element.
// Re-exports the portable core so other code (or another environment) can
// import the raw skeleton/pose data without the DOM layer.
import { CharacterRig } from './rig.js';

export { bones, drawOrder, joints, palette } from './skeleton.js';
export { poses, clips } from './poses.js';
export { CharacterRig, buildRig } from './rig.js';

if (typeof customElements !== 'undefined' && !customElements.get('character-rig')) {
  customElements.define('character-rig', CharacterRig);
}
