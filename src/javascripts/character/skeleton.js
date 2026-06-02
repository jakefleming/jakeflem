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
  torso: { parent: 'root', pivot: [0, 2], tip: [0, -26], width: 52, kind: 'body' },
  head: { parent: 'torso', pivot: [0, -26], type: 'head', radius: 40 },

  // arms are orange (skin) with a white sleeve at the shoulder; round "mitten"
  // hands come free from the round stroke caps. Shoulders sit low on the body.
  armB: { parent: 'torso', pivot: [-7, -20], tip: [0, 24], width: 31, kind: 'skin' },
  forearmB: { parent: 'armB', pivot: [0, 24], tip: [0, 22], width: 29, kind: 'skin' },
  armF: { parent: 'torso', pivot: [7, -20], tip: [0, 24], width: 33, kind: 'skin' },
  forearmF: { parent: 'armF', pivot: [0, 24], tip: [0, 22], width: 31, kind: 'skin' },

  // short black legs ending in chunky shoes
  thighB: { parent: 'root', pivot: [-6, 2], tip: [0, 19], width: 25, kind: 'leg' },
  shinB: { parent: 'thighB', pivot: [0, 19], tip: [0, 16], width: 23, kind: 'leg' },
  footB: { parent: 'shinB', pivot: [0, 16], type: 'shoe' },
  thighF: { parent: 'root', pivot: [6, 2], tip: [0, 19], width: 27, kind: 'leg' },
  shinF: { parent: 'thighF', pivot: [0, 19], tip: [0, 16], width: 25, kind: 'leg' },
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
