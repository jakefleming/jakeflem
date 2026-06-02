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

// Draw the chibi head: orange face, big puffy black hair, brows, dot eyes,
// cheeks and a smile. Head-local origin sits at the neck; the face is above it.
function makeHead(pal) {
  const g = svg('g');
  const ink = pal.ink, skin = pal.skin;
  // face (round), with the orange ear on the back (left) side
  g.appendChild(svg('ellipse', { cx: 2, cy: -30, rx: 39, ry: 40, fill: skin, stroke: ink, 'stroke-width': 4 }));
  g.appendChild(svg('ellipse', { cx: -36, cy: -8, rx: 9, ry: 13, fill: skin, stroke: ink, 'stroke-width': 4 }));
  // styled black hair — a swept quiff: volume up and back, fringe across the
  // forehead with a small curl at the front, sideburn down the back side.
  const hair = svg('g', { fill: ink, stroke: ink, 'stroke-width': 3, 'stroke-linejoin': 'round' });
  hair.appendChild(svg('path', {
    d: 'M -28,-30 C -44,-42 -46,-72 -20,-83 C 2,-92 30,-88 42,-72 '
     + 'C 50,-61 49,-51 41,-48 C 38,-57 30,-59 24,-53 C 23,-49 25,-46 21,-46 '
     + 'C 11,-53 -7,-55 -19,-49 C -25,-46 -27,-39 -29,-30 Z',
  }));
  // sideburn curl swooping down past the ear on the back side
  hair.appendChild(svg('path', { d: 'M -29,-34 C -38,-28 -40,-16 -33,-12 C -30,-19 -27,-25 -24,-31 Z' }));
  g.appendChild(hair);
  // two little forehead bangs poking down into the orange
  g.appendChild(svg('path', { d: 'M -14,-50 q 7,9 14,1', fill: ink, stroke: ink, 'stroke-width': 2 }));
  g.appendChild(svg('path', { d: 'M 2,-50 q 7,8 13,1', fill: ink, stroke: ink, 'stroke-width': 2 }));
  // brows (facing +x / right)
  g.appendChild(svg('path', { d: 'M -16,-26 Q -9,-31 -2,-27', fill: 'none', stroke: ink, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  g.appendChild(svg('path', { d: 'M 12,-26 Q 19,-31 26,-27', fill: 'none', stroke: ink, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  // dot eyes
  g.appendChild(svg('circle', { cx: -9, cy: -16, r: 3.2, fill: ink }));
  g.appendChild(svg('circle', { cx: 19, cy: -16, r: 3.2, fill: ink }));
  // cheeks
  g.appendChild(svg('circle', { cx: -20, cy: -3, r: 2.2, fill: ink }));
  g.appendChild(svg('circle', { cx: 30, cy: -3, r: 2.2, fill: ink }));
  // cheerful open smile
  g.appendChild(svg('path', { d: 'M 0,-7 Q 10,7 20,-7 Q 10,-1 0,-7 Z', fill: ink }));
  return g;
}

// Draw a bone's geometry by kind. `skin` arms = orange capsule with a black
// outline (drawn as a wide ink stroke under a narrower orange one) + a white
// sleeve cuff at the shoulder. `leg` = solid black. `shoe` = a black bulb.
function makeShape(name, pal) {
  const b = bones[name];
  const g = svg('g');
  if (b.type === 'head') return makeHead(pal);

  if (b.type === 'shoe') {
    g.appendChild(svg('ellipse', { cx: 6, cy: 3, rx: 17, ry: 12, fill: pal.ink, stroke: pal.ink, 'stroke-width': 4 }));
    return g;
  }

  const [x2, y2] = b.tip;
  const line = (w, color) => svg('line', { x1: 0, y1: 0, x2, y2, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

  if (b.kind === 'skin') {
    g.appendChild(line(b.width, pal.ink)); // outline
    g.appendChild(line(b.width - 8, pal.skin)); // orange fill
    if (name === 'armF' || name === 'armB') {
      // white sleeve covering the upper ~half of the arm (the arm's black
      // outline shows around it); orange forearm/hand below
      g.appendChild(svg('line', { x1: 0, y1: 0, x2: 0, y2: 15, stroke: pal.paper, 'stroke-width': b.width - 8, 'stroke-linecap': 'round' }));
    }
    return g;
  }

  if (b.kind === 'body') {
    g.appendChild(line(b.width, pal.ink)); // black body
    // small white collar peeking at the neckline
    g.appendChild(svg('path', { d: 'M 0,-33 L 9,-21 Q 0,-18 -9,-21 Z', fill: pal.paper, stroke: pal.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
    return g;
  }

  // legs / default: solid black capsule
  g.appendChild(line(b.width, pal.ink));
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

  const root = svg('svg', { viewBox: '0 0 220 250', class: 'rig-svg' });
  root.appendChild(svg('ellipse', { class: 'rig-shadow', cx: 110, cy: 222, rx: 42, ry: 8, fill: pal.ink }));
  const anchor = svg('g', { transform: 'translate(110 150)' });
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
  :host{ display:inline-block; width:220px; height:250px; }
  .rig-svg{ width:100%; height:100%; overflow:visible; }
  .rig-shadow{ opacity:.9; transition:transform .28s ease, opacity .28s ease; transform-box:view-box; transform-origin:110px 222px; }
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
