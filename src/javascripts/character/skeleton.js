// ─────────────────────────────────────────────────────────────────────────
// PORTABLE RIG CORE — engine-agnostic. No DOM, no SVG, no CSS.
// This file (plus poses.js) is the asset you lift into another environment.
// ─────────────────────────────────────────────────────────────────────────
//
// CONVENTIONS
//   • Coordinate space: SVG-style. +x = right, +y = DOWN. Units are arbitrary
//     (the renderer scales them). The character faces +x (to the right).
//   • Each bone rotates about its own joint (`pivot`), given in the PARENT
//     bone's local space. The root's pivot is the world anchor.
//   • A bone's geometry is drawn from its pivot to `tip` in its REST pose.
//     A pose/animation angle is a rotation (in DEGREES, clockwise-positive)
//     applied ON TOP of that rest orientation. So 0° always means "as drawn".
//   • `palette` keys are resolved by the renderer to actual colors, so the
//     look is themeable without touching geometry.
//
// A game engine can ignore `tip`/`type`/`width` (those are render hints) and
// just consume the hierarchy + pivots + the angle tracks in poses.js.

export const palette = {
  ink: '#000001', // outlines / limbs
  pop: '#FB3600', // orange accent (shirt, shoes)
  paper: '#F8F8F8', // face / highlights
};

// Bone hierarchy. `pivot` is the joint position in the parent's local space;
// `tip` is where the bone ends in its own local space (rest pose).
export const bones = {
  root: { parent: null, pivot: [0, 0] },

  torso: { parent: 'root', pivot: [0, 0], tip: [0, -48], type: 'limb', width: 24, color: 'ink' },
  head: { parent: 'torso', pivot: [0, -48], type: 'head', radius: 18 },

  // Back-side limbs (rendered behind the torso, drawn slightly thinner/darker).
  armB: { parent: 'torso', pivot: [0, -42], tip: [0, 26], type: 'limb', width: 15, color: 'ink' },
  forearmB: { parent: 'armB', pivot: [0, 26], tip: [0, 24], type: 'limb', width: 14, color: 'ink' },
  thighB: { parent: 'root', pivot: [0, 2], tip: [0, 34], type: 'limb', width: 19, color: 'ink' },
  shinB: { parent: 'thighB', pivot: [0, 34], tip: [0, 32], type: 'limb', width: 17, color: 'ink' },
  footB: { parent: 'shinB', pivot: [0, 32], tip: [16, 0], type: 'limb', width: 13, color: 'ink' },

  // Front-side limbs (rendered in front of the torso).
  thighF: { parent: 'root', pivot: [0, 2], tip: [0, 34], type: 'limb', width: 20, color: 'ink' },
  shinF: { parent: 'thighF', pivot: [0, 34], tip: [0, 32], type: 'limb', width: 18, color: 'ink' },
  footF: { parent: 'shinF', pivot: [0, 32], tip: [16, 0], type: 'limb', width: 14, color: 'ink' },
  armF: { parent: 'torso', pivot: [0, -42], tip: [0, 26], type: 'limb', width: 16, color: 'ink' },
  forearmF: { parent: 'armF', pivot: [0, 26], tip: [0, 24], type: 'limb', width: 15, color: 'ink' },
};

// Painter's order (back to front). Transform hierarchy is independent of this.
export const drawOrder = [
  'armB', 'forearmB', 'thighB', 'shinB', 'footB',
  'torso', 'head',
  'thighF', 'shinF', 'footF', 'armF', 'forearmF',
];

// Names of the joints that animation actually drives (everything else is rigid).
export const joints = [
  'torso', 'head',
  'armB', 'forearmB', 'thighB', 'shinB', 'footB',
  'thighF', 'shinF', 'footF', 'armF', 'forearmF',
];
