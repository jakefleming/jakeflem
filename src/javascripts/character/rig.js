// ─────────────────────────────────────────────────────────────────────────
// WEB RENDERER + <character-rig> component.
// This layer is the only part that knows about SVG/CSS/DOM. It reads the
// portable core (skeleton.js + poses.js) and renders it; swap this file out
// to target canvas, a game engine, etc. The character data travels untouched.
// ─────────────────────────────────────────────────────────────────────────
import { bones, drawOrder, joints, palette as defaultPalette } from './skeleton.js';
import { poses, clips, shadowTrack } from './poses.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}) => {
  const node = document.createElementNS(SVGNS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
};

// Compose a bone's transform string. Only the root carries the vertical "bob".
function boneTransform(name, angle, ty = 0) {
  const [px, py] = bones[name].pivot;
  if (name === 'root') return `translate(${px}px, ${py + ty}px) rotate(${angle}deg)`;
  return `translate(${px}px, ${py}px) rotate(${angle}deg)`;
}

// Draw a bone's geometry (a round-capped "capsule" limb, or the head).
function makeShape(name, pal) {
  const b = bones[name];
  const g = svg('g');
  if (b.type === 'head') {
    g.appendChild(svg('circle', { cx: 0, cy: -18, r: b.radius, fill: pal.paper, stroke: pal.ink, 'stroke-width': 3 }));
    // hair tuft (faces back/up)
    g.appendChild(svg('path', { d: 'M -16,-26 Q -2,-46 18,-30 Q 6,-34 -2,-30 Q -10,-30 -16,-22 Z', fill: pal.ink }));
    // eye + brow (faces +x / right)
    g.appendChild(svg('circle', { cx: 9, cy: -20, r: 2.6, fill: pal.ink }));
    g.appendChild(svg('path', { d: 'M 5,-9 Q 11,-6 15,-11', fill: 'none', stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    return g;
  }
  const [x2, y2] = b.tip;
  g.appendChild(svg('line', { x1: 0, y1: 0, x2, y2, stroke: pal[b.color] || pal.ink, 'stroke-width': b.width, 'stroke-linecap': 'round' }));
  // accents: orange shirt over the torso, orange toe on the feet
  if (name === 'torso') {
    g.appendChild(svg('line', { x1: 0, y1: -6, x2: 0, y2: -40, stroke: pal.pop, 'stroke-width': b.width - 6, 'stroke-linecap': 'round' }));
  }
  if (name === 'footF' || name === 'footB') {
    g.appendChild(svg('line', { x1: x2 - 7, y1: 0, x2, y2: 0, stroke: pal.pop, 'stroke-width': b.width, 'stroke-linecap': 'round' }));
  }
  return g;
}

// Build the full SVG and return { svg, groups } where groups maps bone -> <g>.
export function buildRig(pal = defaultPalette) {
  const groups = {};
  for (const name in bones) {
    groups[name] = svg('g', { class: 'bone', 'data-bone': name });
  }

  // Assemble children in painter's order WITHIN the transform hierarchy.
  const link = (parent, child) => groups[parent].appendChild(groups[child]);
  const shape = (name) => groups[name].appendChild(makeShape(name, pal));

  // back arm / leg chains
  shape('armB'); link('armB', 'forearmB'); shape('forearmB');
  shape('thighB'); link('thighB', 'shinB'); shape('shinB'); link('shinB', 'footB'); shape('footB');
  // front arm / leg chains
  shape('armF'); link('armF', 'forearmF'); shape('forearmF');
  shape('thighF'); link('thighF', 'shinF'); shape('shinF'); link('shinF', 'footF'); shape('footF');

  // torso: back arm BEHIND the torso shape, head + front arm IN FRONT
  groups.torso.appendChild(groups.armB);
  groups.torso.appendChild(makeShape('torso', pal));
  groups.torso.appendChild(groups.head);
  groups.head.appendChild(makeShape('head', pal));
  groups.torso.appendChild(groups.armF);

  // root: back leg, torso, front leg
  groups.root.appendChild(groups.thighB);
  groups.root.appendChild(groups.torso);
  groups.root.appendChild(groups.thighF);

  const root = svg('svg', { viewBox: '0 0 240 264', class: 'rig-svg' });
  root.appendChild(svg('ellipse', { class: 'rig-shadow', cx: 120, cy: 226, rx: 34, ry: 7 }));
  const anchor = svg('g', { transform: 'translate(120 150)' });
  anchor.appendChild(groups.root);
  root.appendChild(anchor);
  return { svg: root, groups };
}

// Compile a clip into one @keyframes block per animated bone (transform tracks
// interpolate natively, no @property needed). Loop clips wrap back to their
// first sample; one-shot clips end on their final sample.
function compileClip(clipName, clip) {
  const kfs = [...clip.keyframes].sort((a, b) => a.t - b.t);
  let css = '';
  for (const name of [...joints, 'root']) {
    let body = '';
    const frame = (kf) => {
      const angle = name === 'root' ? 0 : (kf[name] || 0);
      const ty = name === 'root' ? (kf.root && kf.root.ty) || 0 : 0;
      return `transform:${boneTransform(name, angle, ty)};`;
    };
    for (const kf of kfs) body += `${(kf.t * 100).toFixed(2)}%{${frame(kf)}}`;
    if (clip.loop) body += `100%{${frame(kfs[0])}}`; // seamless wrap
    else if (kfs[kfs.length - 1].t < 1) body += `100%{${frame(kfs[kfs.length - 1])}}`;
    css += `@keyframes cg-${clipName}-${name}{${body}}`;
  }
  // optional shadow track (scale + fade as the body leaps)
  const track = shadowTrack[clipName];
  if (track) {
    let body = '';
    for (const k of track) body += `${(k.t * 100).toFixed(2)}%{transform:scale(${k.scale});opacity:${k.opacity};}`;
    css += `@keyframes cg-${clipName}-shadow{${body}}`;
  }
  return css;
}

function compileAll() {
  return Object.keys(clips).map((name) => compileClip(name, clips[name])).join('');
}

const baseCSS = `
  :host{ display:inline-block; width:240px; height:264px; }
  .rig-svg{ width:100%; height:100%; overflow:visible; }
  .rig-shadow{ fill:rgba(0,0,1,.16); transition:transform .28s ease, opacity .28s ease; transform-box:view-box; transform-origin:120px 226px; }
  .bone{ transform-box:view-box; transform-origin:0 0; transition:transform .26s ease; }
`;

export class CharacterRig extends HTMLElement {
  static get observedAttributes() { return ['pose']; }

  connectedCallback() {
    if (!this._built) this._build();
    this._apply(this.getAttribute('pose') || 'idle');
  }

  attributeChangedCallback(name, _old, val) {
    if (name === 'pose' && this._built) this._apply(val || 'idle');
  }

  _build() {
    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = baseCSS + compileAll();
    const { svg: root, groups } = buildRig();
    this._groups = groups;
    this._shadow = root.querySelector('.rig-shadow');
    this._base = 'idle'; // the sustained pose to return to after a one-shot
    shadow.append(style, root);
    this._built = true;
    this.setPose('idle');
  }

  // ── public API (the same surface a factory wrapper would expose) ──
  setPose(name) {
    const pose = poses[name] || poses.idle;
    if (this._shadow) this._shadow.style.animation = '';
    for (const j of [...joints, 'root']) {
      const angle = j === 'root' ? 0 : (pose[j] || 0);
      const ty = j === 'root' ? (pose.root && pose.root.ty) || 0 : 0;
      this._groups[j].style.animation = '';
      this._groups[j].style.transform = boneTransform(j, angle, ty);
    }
  }

  // Start a looping clip (idle/run). One-shot clips should use play() too but
  // are normally reached via jump().
  play(clipName) {
    const clip = clips[clipName];
    if (!clip) return;
    const iter = clip.loop ? 'infinite' : '1';
    const fill = clip.loop ? 'none' : 'forwards';
    for (const j of [...joints, 'root']) {
      this._groups[j].style.transform = '';
      this._groups[j].style.animation = `cg-${clipName}-${j} ${clip.duration}s linear 0s ${iter} normal ${fill}`;
    }
    if (this._shadow) {
      this._shadow.style.animation = shadowTrack[clipName]
        ? `cg-${clipName}-shadow ${clip.duration}s linear 0s ${iter} normal ${fill}`
        : '';
    }
  }

  // One-shot leap, then return to whatever sustained pose was active.
  jump() {
    if (!this._built || this._jumping) return;
    this._jumping = true;
    this.play('jump');
    this._groups.torso.addEventListener('animationend', () => {
      this._jumping = false;
      this._apply(this._base);
    }, { once: true });
  }

  stop() {
    if (!this._groups) return;
    for (const j of [...joints, 'root']) this._groups[j].style.animation = '';
    if (this._shadow) this._shadow.style.animation = '';
  }

  _apply(name) {
    if (name === 'jump') { this.jump(); return; }
    this._base = name;
    if (clips[name]) this.play(name);
    else this.setPose(name);
  }
}
