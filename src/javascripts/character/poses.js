// ─────────────────────────────────────────────────────────────────────────
// PORTABLE ANIMATION DATA — engine-agnostic. Just joint angles + timing.
// Angles are in DEGREES, clockwise-positive, applied on top of the bone's
// rest orientation (see skeleton.js). `root` may also carry {ty} = vertical
// offset (the body "bob"/leap), in the same units as the skeleton.
// ─────────────────────────────────────────────────────────────────────────

// Static fallback pose (used if a name has no clip). joint -> angle (deg).
export const poses = {
  idle: {
    root: { ty: 0 }, torso: 5, head: -2,
    armF: -10, forearmF: 58, armB: 16, forearmB: 40,
    thighF: -10, shinF: 7, footF: 0, thighB: 11, shinB: -6, footB: 0,
  },
};

// Animation clips. `keyframes` sample a normalized timeline (t = 0..1); each
// sample is a pose-like map. `loop` clips wrap t=1 -> t=0; one-shot clips hold
// their final sample (and the renderer returns to the resting pose after).
export const clips = {
  // Gentle breathing / weight-shift so "idle" feels alive.
  idle: {
    duration: 2.6,
    loop: true,
    keyframes: [
      { t: 0.0, root: { ty: 0 }, torso: 5, head: -2,
        armF: -10, forearmF: 58, armB: 16, forearmB: 40,
        thighF: -10, shinF: 7, thighB: 11, shinB: -6 },
      { t: 0.5, root: { ty: -3 }, torso: 6, head: -3,
        armF: -8, forearmF: 54, armB: 13, forearmB: 43,
        thighF: -10, shinF: 6, thighB: 11, shinB: -5 },
    ],
  },

  // Side-view jog. Front limb leads; arms swing opposite the legs.
  run: {
    duration: 0.6,
    loop: true,
    keyframes: [
      { t: 0.0, root: { ty: 3 }, torso: 14, head: -7,
        thighF: -28, shinF: 16, footF: -14,
        thighB: 26, shinB: 56, footB: 20,
        armF: 40, forearmF: 24, armB: -36, forearmB: 34 },
      { t: 0.25, root: { ty: -7 }, torso: 14, head: -7,
        thighF: -6, shinF: 30, footF: -8,
        thighB: 6, shinB: 20, footB: 6,
        armF: 10, forearmF: 30, armB: -8, forearmB: 30 },
      { t: 0.5, root: { ty: 3 }, torso: 14, head: -7,
        thighF: 26, shinF: 56, footF: 20,
        thighB: -28, shinB: 16, footB: -14,
        armF: -36, forearmF: 34, armB: 40, forearmB: 24 },
      { t: 0.75, root: { ty: -7 }, torso: 14, head: -7,
        thighF: 6, shinF: 20, footF: 6,
        thighB: -6, shinB: 30, footB: -8,
        armF: -8, forearmF: 30, armB: 10, forearmB: 30 },
    ],
  },

  // One-shot leap: anticipate (crouch) -> launch -> tuck at apex -> land.
  jump: {
    duration: 0.9,
    loop: false,
    keyframes: [
      { t: 0.0, root: { ty: 0 }, torso: 6, head: -2,
        armF: -2, forearmF: 14, armB: 5, forearmB: 12,
        thighF: -5, shinF: 5, thighB: 7, shinB: -5 },
      { t: 0.18, root: { ty: 14 }, torso: 20, head: 2, // crouch / load
        armF: 46, forearmF: 28, armB: 40, forearmB: 30,
        thighF: 24, shinF: -44, thighB: 26, shinB: -46 },
      { t: 0.4, root: { ty: -58 }, torso: 8, head: -6, // launch up, arms drive up
        armF: -68, forearmF: 16, armB: -60, forearmB: 16,
        thighF: -14, shinF: 10, thighB: -10, shinB: 10 },
      { t: 0.6, root: { ty: -66 }, torso: 6, head: -6, // apex, tuck knees
        armF: -78, forearmF: 18, armB: -72, forearmB: 18,
        thighF: -34, shinF: 52, thighB: -30, shinB: 50 },
      { t: 0.85, root: { ty: 12 }, torso: 22, head: 2, // land / absorb
        armF: 30, forearmF: 26, armB: 26, forearmB: 28,
        thighF: 22, shinF: -40, thighB: 24, shinB: -42 },
      { t: 1.0, root: { ty: 0 }, torso: 6, head: -2, // settle
        armF: -2, forearmF: 14, armB: 5, forearmB: 12,
        thighF: -5, shinF: 5, thighB: 7, shinB: -5 },
    ],
  },
};

// Vertical leap height drives shadow scale/opacity. Renderer reads this so the
// shadow shrinks as the character rises (kept here so it travels with the data).
export const shadowTrack = {
  jump: [
    { t: 0.0, scale: 1, opacity: 0.9 },
    { t: 0.18, scale: 1.05, opacity: 0.95 },
    { t: 0.6, scale: 0.45, opacity: 0.4 },
    { t: 0.85, scale: 1.05, opacity: 0.95 },
    { t: 1.0, scale: 1, opacity: 0.9 },
  ],
};
