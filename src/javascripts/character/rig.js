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

// The head is the character's identity (face, hair, expression) and is nearly
// rigid across the run, so we use the ORIGINAL artwork verbatim — lifted from
// guy-jogging.svg — to match it exactly. Coordinates are in the source frame's
// space (face centred at 91,61); the wrapper transform scales it and moves the
// face centre to the head bone's local origin. ink #000001 / skin #FB3600.
const HEAD_ART = `<g transform="translate(0 -46) scale(1.85) translate(-91 -61)">
  <path d="M68.2,67.7C72.5,83.5,89.6,90,92.5,88.2s-3-9.7-3-9.7S76.9,64.8,68.2,67.7z" fill="#000001"/>
  <path d="M78,79c0,6.6-3,12.8-8,17l-7-7C63,89,74,76,78,79z" fill="#000001"/>
  <circle cx="91.1" cy="61" r="21" fill="#FB3600" stroke="#000001" stroke-width="3"/>
  <ellipse transform="matrix(0.9519 -0.3065 0.3065 0.9519 -12.2794 23.8006)" cx="69.6" cy="51" rx="4" ry="5.5" fill="#000001" stroke="#000001" stroke-width="3"/>
  <ellipse transform="matrix(0.7071 -0.7071 0.7071 0.7071 -3.2152 67.708)" cx="80.1" cy="37.7" rx="13.3" ry="6.2" fill="#000001" stroke="#000001" stroke-width="3"/>
  <ellipse transform="matrix(0.9519 -0.3065 0.3065 0.9519 -5.9717 31.4391)" cx="97.1" cy="34.7" rx="13.3" ry="6.2" fill="#000001" stroke="#000001" stroke-width="3"/>
  <ellipse transform="matrix(0.34 -0.9404 0.9404 0.34 20.6149 114.8431)" cx="92.1" cy="42.7" rx="6.2" ry="13.3" fill="#000001" stroke="#000001" stroke-width="3"/>
  <ellipse transform="matrix(0.9968 -0.08011194 0.08011194 0.9968 -3.2491 8.4853)" cx="104.1" cy="44.7" rx="13.3" ry="6.2" fill="#000001" stroke="#000001" stroke-width="3"/>
  <path d="M73.8,68.9c-4.1,1.7-8.8-0.1-10.5-4.2c-1.7-4.1,0.1-8.8,4.2-10.5c2-0.9,4.3-0.9,6.3,0" fill="#FB3600" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <ellipse transform="matrix(0.9519 -0.3065 0.3065 0.9519 -12.958 25.4773)" cx="74.6" cy="54" rx="4" ry="5.5" fill="#000001" stroke="#000001" stroke-width="3"/>
  <path d="M85.2,53.7c1-1.8,3.2-2.4,5-1.5" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <path d="M104.1,53.7c-1-1.8-3.2-2.4-5-1.5" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <path d="M86.5,58.4c1.2-1.2,3.1-1.2,4.2,0" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <path d="M98.5,58.4c1.2-1.2,3.1-1.2,4.2,0" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <path d="M96.8,65.4c-1.2,1.2-3.1,1.2-4.2,0" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <circle cx="83.6" cy="64.5" r="1" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
  <circle cx="105.6" cy="64.5" r="1" fill="none" stroke="#000001" stroke-width="3" stroke-linecap="round"/>
</g>`;

function makeHead() {
  const g = svg('g');
  g.innerHTML = HEAD_ART;
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
    // white shirt = black outline (wide stroke) under a narrower white stroke
    g.appendChild(line(b.width, pal.ink));
    g.appendChild(line(b.width - 6, pal.paper));
    // the head casts a black shadow over the top of the shirt
    g.appendChild(svg('ellipse', { cx: 1, cy: -18, rx: b.width / 2 - 5, ry: 11, fill: pal.ink }));
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

  // torso z-order: back arm BEHIND the shirt, then shirt, then front arm in
  // front of the shirt but BEHIND the head (so the arm never covers the face).
  groups.torso.appendChild(groups.armB);
  groups.torso.appendChild(makeShape('torso', pal));
  groups.torso.appendChild(groups.armF);
  groups.torso.appendChild(groups.head);
  groups.head.appendChild(makeShape('head', pal));

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
