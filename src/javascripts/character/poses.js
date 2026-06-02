// ─────────────────────────────────────────────────────────────────────────
// PORTABLE ANIMATION DATA — engine-agnostic. Just joint angles + timing.
// Angles are in DEGREES, clockwise-positive, applied on top of the bone's
// rest orientation (see skeleton.js). `root` may also carry {ty} = vertical
// offset (the body "bob"), in the same units as the skeleton.
// ─────────────────────────────────────────────────────────────────────────

// A static pose: joint -> angle (deg). Missing joints default to 0.
export const poses = {
  idle: {
    root: { ty: 0 },
    torso: 4,
    head: -3,
    armB: 10, forearmB: 14,
    armF: -8, forearmF: 18,
    thighB: 6, shinB: -6, footB: 0,
    thighF: -4, shinF: 4, footF: 0,
  },
};

// An animation clip. `keyframes` are samples along a normalized timeline
// (t = 0..1). Each sample is a pose-like map. `loop` clips wrap t=1 -> t=0.
export const clips = {
  run: {
    duration: 0.62, // seconds for one full stride cycle
    loop: true,
    keyframes: [
      { t: 0.0, root: { ty: 2 }, torso: 12, head: -6,
        thighF: -34, shinF: 18, footF: -14, // front leg reaching forward
        thighB: 32, shinB: 54, footB: 24, // back leg pushing off, knee bent
        armF: 34, forearmF: 40, // arms opposite to legs
        armB: -32, forearmB: 60, head_: 0 },
      { t: 0.25, root: { ty: -6 }, torso: 12, head: -6,
        thighF: -6, shinF: 26, footF: -8,
        thighB: 8, shinB: 18, footB: 6,
        armF: 8, forearmF: 30,
        armB: -6, forearmB: 38 },
      { t: 0.5, root: { ty: 2 }, torso: 12, head: -6,
        thighF: 32, shinF: 54, footF: 24,
        thighB: -34, shinB: 18, footB: -14,
        armF: -32, forearmF: 60,
        armB: 34, forearmB: 40 },
      { t: 0.75, root: { ty: -6 }, torso: 12, head: -6,
        thighF: 8, shinF: 18, footF: 6,
        thighB: -6, shinB: 26, footB: -8,
        armF: -6, forearmF: 38,
        armB: 8, forearmB: 30 },
    ],
  },
};
