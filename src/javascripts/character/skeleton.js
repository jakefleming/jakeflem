// ─────────────────────────────────────────────────────────────────────────
// PORTABLE RIG CORE — engine-agnostic. No DOM, no SVG, no CSS.
// Chibi mascot proportions: a big head (orange face + black hair) on a small
// chunky body. See rig.js for how `kind` is rendered.
//
// CONVENTIONS (unchanged):
//   • +x right, +y DOWN. Angles in DEGREES, clockwise-positive, applied on top
//     of each bone's rest orientation. 0° = "as drawn".
//   • A bone rotates about its `pivot` (its joint), in the parent's local space.
//   • Geometry runs from the pivot to `tip` in the bone's own local space.
// ─────────────────────────────────────────────────────────────────────────

export const palette = {
  ink: '#000001', // hair, body, legs, shoes, outlines
  skin: '#FB3600', // face + arms/hands (orange)
  paper: '#F8F8F8', // shirt collar + sleeve cuffs
};

export const bones = {
  root: { parent: null, pivot: [0, 0] },

  // short, squat white-shirt body (with a black outline + the head's shadow)
  torso: { parent: 'root', pivot: [0, 2], tip: [0, -30], width: 52, kind: 'body' },
  head: { parent: 'torso', pivot: [0, -30], type: 'head', radius: 40 },

  // The character wears a white short-sleeve shirt: the UPPER arm is a white
  // sleeve, the forearm + mitten hand are orange skin. Shoulders sit HIGH,
  // tucked just under the head (per the source), so arms pump at chest height.
  armB: { parent: 'torso', pivot: [-6, -26], tip: [0, 22], width: 30, kind: 'sleeve' },
  forearmB: { parent: 'armB', pivot: [0, 22], tip: [0, 21], width: 28, kind: 'skin' },
  armF: { parent: 'torso', pivot: [6, -26], tip: [0, 22], width: 32, kind: 'sleeve' },
  forearmF: { parent: 'armF', pivot: [0, 22], tip: [0, 21], width: 30, kind: 'skin' },

  // short, THICK black legs (≈ source stroke width) ending in chunky shoes
  thighB: { parent: 'root', pivot: [-8, 2], tip: [0, 19], width: 34, kind: 'leg' },
  shinB: { parent: 'thighB', pivot: [0, 19], tip: [0, 16], width: 32, kind: 'leg' },
  footB: { parent: 'shinB', pivot: [0, 16], type: 'shoe' },
  thighF: { parent: 'root', pivot: [8, 2], tip: [0, 19], width: 36, kind: 'leg' },
  shinF: { parent: 'thighF', pivot: [0, 19], tip: [0, 16], width: 34, kind: 'leg' },
  footF: { parent: 'shinF', pivot: [0, 16], type: 'shoe' },
};

// Painter's order (back to front). Transform hierarchy is independent of this.
export const drawOrder = [
  'armB', 'forearmB', 'thighB', 'shinB', 'footB',
  'torso', 'head',
  'thighF', 'shinF', 'footF', 'armF', 'forearmF',
];

export const joints = [
  'torso', 'head',
  'armB', 'forearmB', 'thighB', 'shinB', 'footB',
  'thighF', 'shinF', 'footF', 'armF', 'forearmF',
];
