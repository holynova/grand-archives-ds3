import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============ 基础场景 ============ */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth - 296, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151b26);
scene.fog = new THREE.Fog(0x151b26, 55, 130);

const camera = new THREE.PerspectiveCamera(48, (innerWidth - 296) / innerHeight, 0.1, 400);
camera.position.set(21, 14, 25);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 9, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 2;
controls.maxDistance = 70;
controls.autoRotateSpeed = 1.0;

const hemi = new THREE.HemisphereLight(0x6a7a95, 0x3a322a, 0.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a8, 1.35);
sun.position.set(20, 28, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -10;
sun.shadow.camera.far = 100;
sun.shadow.bias = -0.0006;
scene.add(sun);
// 室内暖光
const plWax = new THREE.PointLight(0xff9a3e, 60, 15, 2);
plWax.position.set(-3.2, 2.8, 0.5); scene.add(plWax);
const plThrone = new THREE.PointLight(0xffb060, 90, 22, 2);
plThrone.position.set(0, 15.5, -2); scene.add(plThrone);
const plFire = new THREE.PointLight(0xff8c2e, 50, 11, 2);
plFire.position.set(7, 1.8, 9); scene.add(plFire);

/* ============ 程序化纹理 ============ */
function canvasTex(size, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
let _s = 23;
function rnd() { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; }

const stoneTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#5b6067'; g.fillRect(0, 0, s, s);
  const bh = 42;
  for (let y = 0, row = 0; y < s; y += bh, row++) {
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, y, s, 3);
    const off = (row % 2) * 42;
    for (let x = -84; x < s + 84; x += 84) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + off, y, 3, bh); }
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.1)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2);
  }
}, 3, 2);
const floorTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#33363c'; g.fillRect(0, 0, s, s);
  for (let y = 0; y <= s; y += 64) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, y, s, 3); g.fillRect(y, 0, 3, s); }
  for (let i = 0; i < 700; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.07)';
    g.fillRect(rnd() * s, rnd() * s, 2, 2);
  }
}, 4, 4);
const ashTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#252926'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = rnd() > .6 ? 'rgba(130,125,110,.22)' : 'rgba(0,0,0,.4)';
    const r = 1 + rnd() * 3;
    g.fillRect(rnd() * s, rnd() * s, r, r);
  }
}, 16, 16);
const bannerTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#141416'; g.fillRect(0, 0, s, s);
  g.fillStyle = '#5e1420'; g.fillRect(14, 0, s - 28, s);
  g.strokeStyle = '#a8842e'; g.lineWidth = 5; g.strokeRect(19, 7, s - 38, s - 14);
  g.strokeStyle = '#c09a3e'; g.lineWidth = 4;
  g.beginPath(); g.arc(s / 2, s * 0.3, 20, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(s / 2, s * 0.52); g.lineTo(s / 2, s * 0.78); g.stroke();
  g.beginPath(); g.moveTo(s / 2 - 14, s * 0.62); g.lineTo(s / 2 + 14, s * 0.62); g.stroke();
  g.fillStyle = '#141416';
  g.beginPath(); g.moveTo(14, s); g.lineTo(s / 2, s - 26); g.lineTo(s - 14, s); g.closePath(); g.fill();
});

/* ============ 材质与建模助手 ============ */
function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.92, metalness: o.metal ?? 0,
    map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    side: o.side || THREE.FrontSide
  });
}
const extMats = [];   // 外墙材质（透视模式下变透明）
function extM(color, o = {}) { const m = M(color, o); extMats.push(m); return m; }

function box(w, h, d, material, x, y, z, parent, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function cyl(rt, rb, h, material, x, y, z, parent, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function sph(r, material, x, y, z, parent, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), material);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m);
  tagPart(m, parent);
  return m;
}
function tagPart(mesh, parent) {
  let n = parent;
  while (n) {
    if (n.userData && n.userData.isPart) { mesh.userData.partId = n.userData.partId; break; }
    n = n.parent;
  }
}
function wallSeg(x1, z1, x2, z2, y0, h, t, material, parent) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  return (Math.abs(x2 - x1) > Math.abs(z2 - z1))
    ? box(len, h, t, material, cx, y0 + h / 2, cz, parent)
    : box(t, h, len, material, cx, y0 + h / 2, cz, parent);
}

/* ============ 部件注册表 ============ */
const PARTS = {};
const CATS = { out: '外部', f0: '底层', f1: '中层', f2: '顶层' };
function defPart(id, meta) { PARTS[id] = Object.assign({ id, group: null }, meta); }
function P(id, parent) {
  const g = new THREE.Group();
  g.userData.isPart = true; g.userData.partId = id;
  PARTS[id].group = g;
  (parent || scene).add(g);
  return g;
}

defPart('wall0',   { name: '底层石墙', cat: 'out', layer: 'f0', label: [-6.45, 3.2, 0], viewDir: [-1, .4, .55], desc: '数百年风雨侵蚀的灰岩墙体，下半截凝着蜡油——那是学者们留下的痕迹，还是某种仪式的残留？' });
defPart('wall1',   { name: '中层石墙', cat: 'out', layer: 'mid', label: [-6.45, 9, 0], viewDir: [-1, .4, .55], desc: '书库的中段，石缝里塞满了被风吹出的书页。穿过走廊时，仿佛能听见纸张翻动的声音。' });
defPart('wall2',   { name: '顶层石墙', cat: 'out', layer: 'top', label: [-6.45, 14.6, 0], viewDir: [-1, .4, .55], desc: '最接近天空的一层。洛斯里克的王族曾在这里俯瞰整座城池，如今只剩下风。' });
defPart('buttress',{ name: '扶壁', cat: 'out', layer: 'f0', label: [7.2, 2.8, 7.2], viewDir: [1, .4, 1], desc: '粗壮的扶壁撑住塔身，如同巨人的手臂。没有它们，这座书库早就在岁月里塌了。' });
defPart('terrace', { name: '屋顶露台', cat: 'out', layer: 'roof', label: [4.6, 19, 4.6], viewDir: [1, .5, 1], desc: '顶层的露台，石像鬼们蹲在角落俯视众生。雾散时，能从这里看到整个洛斯里克。' });
defPart('gargoyle',{ name: '石像鬼', cat: 'out', layer: 'roof', label: [-5.6, 20, 5.6], viewDir: [-1, .5, 1], desc: '石像鬼雕像，传说会在夜里活过来。也有人说，它们只是在等一个值得出手的猎物。' });
defPart('spire',   { name: '尖塔', cat: 'out', layer: 'roof', label: [0, 25, 0], viewDir: [1, .6, 1], desc: '刺破云层的尖塔，大书库的顶点。双王子的目光，据说能从这里看到传火祭祀场。' });
defPart('bonfire', { name: '篝火', cat: 'out', layer: 'yard', label: [7, 1.7, 9], viewDir: [1, .5, 1], desc: '书库门外的篝火。盘腿坐下，饮一口原素瓶——前方的路还很长，不死人。' });
defPart('hall',    { name: '入口大厅', cat: 'f0', layer: 'f0', xray: 1, label: [0, 3.4, 2.5], viewDir: [1, .5, 1], desc: '推开沉重的木门，灰尘在光柱里飞舞。这里曾是学者们进出的地方，如今只剩下回声。' });
defPart('waxpool', { name: '蜡池', cat: 'f0', layer: 'f0', xray: 1, label: [-3.2, 1.9, 0.5], viewDir: [-1, .5, .6], desc: '乳白色的蜡池。把头浸入蜡中，就能抵御书库深处的诅咒——代价是，你会变得和他们一样。' });
defPart('candle',  { name: '烛台', cat: 'f0', layer: 'f0', xray: 1, label: [3.6, 2.8, 3], viewDir: [1, .5, 1], desc: '高高的烛台，火焰从未熄灭。是谁在为这座空无一人的书库守夜？' });
defPart('chandelier', { name: '吊灯链条', cat: 'f0', layer: 'f0', xray: 1, label: [1.8, 4.8, -0.5], viewDir: [.8, .35, .8], desc: '从穹顶垂下的巨大吊灯，铁链上凝着厚厚的蜡。它的光，照亮过无数个不眠之夜。' });
defPart('stair0',  { name: '石阶', cat: 'f0', layer: 'f0', xray: 1, label: [0, 3.6, -2.5], viewDir: [1, .6, 1], desc: '通往中层的石阶，被无数双脚磨得发亮。他们走上去，是为了寻找那本不存在的书。' });
defPart('stacks',  { name: '环形藏书走廊', cat: 'f1', layer: 'mid', xray: 1, label: [-4.6, 9.2, 2.5], viewDir: [-1, .7, .7], desc: '环形的藏书走廊，书架上塞满典籍。洛斯里克所有的知识——以及所有的谎言——都在这里。' });
defPart('spiral',  { name: '旋转书架楼梯', cat: 'f1', layer: 'mid', xray: 1, label: [0, 10.2, 0], viewDir: [1, .55, 1], desc: '会旋转的书架楼梯，机关驱动着它缓缓转动。走错一步，就会被送进书架深处的黑暗里。' });
defPart('scholar', { name: '学者书桌', cat: 'f1', layer: 'mid', xray: 1, label: [4.3, 8.2, -3.2], viewDir: [1, .6, .4], desc: '学者的书桌，羽毛笔还插在墨水瓶里。他们放下笔的时候，一定没想到自己再也回不来了。' });
defPart('throne',  { name: '双王子王座厅', cat: 'f2', layer: 'top', xray: 1, label: [0, 15, -2], viewDir: [1, .7, 1], desc: '洛斯里克双王子的王座。哥哥洛里安高大沉默，弟弟洛斯里克瘦小多病——王座上坐着的，是诅咒本身。' });
defPart('windows', { name: '落地大窗', cat: 'f2', layer: 'top', label: [0, 15.2, 6.6], viewDir: [.6, .5, 1], desc: '高耸的尖拱落地窗，阳光透过洒进来。这是整座书库里，唯一温暖的地方。' });

/* ============ 尺寸常量 ============ */
const W = 12, D = 12, T = 0.6;   // 塔身宽 / 深 / 墙厚
const F0 = 0.5, H0 = 5.5;        // 底层地面 / 层高
const F1 = 6.0, H1 = 5.5;        // 中层
const F2 = 11.5, H2 = 6.0;       // 顶层
const ROOF = 17.5;               // 露台高度

/* 层组（用于分层展开与视角切换） */
const gF0 = new THREE.Group(), gMid = new THREE.Group(),
      gTop = new THREE.Group(), gRoof = new THREE.Group();
scene.add(gF0, gMid, gTop, gRoof);
const cutWalls = {};  // 剖面视角时隐藏的墙分组

/* ============ 外部 ============ */
const stoneDarkM = M(0x4a4e55, { map: stoneTex, rough: 0.95 });
const flameM = M(0xff7a1e, { emissive: 0xff6a00, ei: 2.4, rough: 0.6 });
const waxM = M(0xe6d9bd, { rough: 0.5 });
const goldM = M(0xa8842e, { rough: 0.4, metal: 0.6 });

(function buildExterior() {
  // 地基
  box(W + 1.2, 1.2, D + 1.2, stoneDarkM, 0, -0.1, 0, gF0);

  const stone0 = extM(0xffffff, { map: stoneTex, rough: 0.95 });
  const stone1 = extM(0xffffff, { map: stoneTex, rough: 0.95 });
  const stone2 = extM(0xffffff, { map: stoneTex, rough: 0.95 });
  function wallTier(Pid, gLayer, y0, h, key) {
    const w = P(Pid, gLayer);
    const s = new THREE.Group(), n = new THREE.Group(), ww = new THREE.Group(), e = new THREE.Group();
    w.add(s, n, ww, e);
    const sm = Pid === 'wall0' ? stone0 : Pid === 'wall1' ? stone1 : stone2;
    box(W, h, T, sm, 0, y0 + h / 2, D / 2 - T / 2, s);
    box(W, h, T, sm, 0, y0 + h / 2, -D / 2 + T / 2, n);
    box(T, h, D, sm, -W / 2 + T / 2, y0 + h / 2, 0, ww);
    box(T, h, D, sm, W / 2 - T / 2, y0 + h / 2, 0, e);
    cutWalls[key + 's'] = s; cutWalls[key + 'e'] = e;
    return { w, s, n, ww, e };
  }
  const t0 = wallTier('wall0', gF0, F0, H0, 'w0');
  const t1 = wallTier('wall1', gMid, F1, H1, 'w1');
  const t2 = wallTier('wall2', gTop, F2, H2, 'w2');
  // 层间腰线
  const trimM = M(0x3a3e45, { rough: 0.9 });
  box(W + 0.3, 0.35, D + 0.3, trimM, 0, F1 - 0.15, 0, t0.w);
  box(W + 0.3, 0.35, D + 0.3, trimM, 0, F2 - 0.15, 0, t1.w);
  box(W + 0.3, 0.4, D + 0.3, trimM, 0, ROOF - 0.2, 0, t2.w);

  // 尖拱窗助手（y = 窗底）
  const glassM = M(0x9fc4e8, { rough: 0.2, metal: 0.1, transparent: true, opacity: 0.5, emissive: 0x2a4a66, ei: 0.35 });
  const frameM = M(0x3a3e45, { rough: 0.85 });
  function archWin(w, h, x, y, z, ry, parent) {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; parent.add(grp);
    box(w + 0.35, h, 0.4, frameM, 0, h / 2, 0, grp);
    const gl = box(w, h - 0.25, 0.12, glassM, 0, h / 2, 0.06, grp); gl.castShadow = false;
    box(0.09, h - 0.25, 0.14, frameM, 0, h / 2, 0.07, grp);
    box(w, 0.09, 0.14, frameM, 0, h * 0.62, 0.07, grp);
    box(w + 0.55, 0.18, 0.5, frameM, 0, -0.05, 0.02, grp);   // 窗台
    const aw = Math.hypot(w / 2 + 0.18, 1.0);                // 尖拱顶
    const a1 = box(aw, 0.28, 0.4, frameM, -(w / 4 + 0.09), h + 0.36, 0, grp); a1.rotation.z = 0.5;
    const a2 = box(aw, 0.28, 0.4, frameM, (w / 4 + 0.09), h + 0.36, 0, grp); a2.rotation.z = -0.5;
    return grp;
  }
  // 底层窗
  for (const x of [-3.5, 3.5]) archWin(1.3, 2.2, x, F0 + 1.6, D / 2 + 0.02, 0, t0.s);
  for (const x of [-3.5, 0, 3.5]) archWin(1.3, 2.2, x, F0 + 1.6, -D / 2 - 0.02, Math.PI, t0.n);
  for (const z of [-2.5, 2.5]) archWin(1.3, 2.2, W / 2 + 0.02, F0 + 1.6, z, Math.PI / 2, t0.e);
  for (const z of [-2.5, 2.5]) archWin(1.3, 2.2, -W / 2 - 0.02, F0 + 1.6, z, -Math.PI / 2, t0.ww);
  // 中层窗
  for (const x of [-3.5, 0, 3.5]) archWin(1.5, 2.8, x, F1 + 1.3, D / 2 + 0.02, 0, t1.s);
  for (const x of [-3.5, 0, 3.5]) archWin(1.5, 2.8, x, F1 + 1.3, -D / 2 - 0.02, Math.PI, t1.n);
  for (const z of [-2, 2]) archWin(1.5, 2.8, W / 2 + 0.02, F1 + 1.3, z, Math.PI / 2, t1.e);
  for (const z of [-2, 2]) archWin(1.5, 2.8, -W / 2 - 0.02, F1 + 1.3, z, -Math.PI / 2, t1.ww);

  // 大门（底层南）
  const doorM = extM(0x4a2f1c, { rough: 0.85 });
  box(3.2, 4.0, 0.7, frameM, 0, F0 + 2.0, D / 2 - 0.1, t0.s);
  box(1.3, 3.4, 0.2, doorM, -0.68, F0 + 1.7, D / 2 + 0.12, t0.s);
  box(1.3, 3.4, 0.2, doorM, 0.68, F0 + 1.7, D / 2 + 0.12, t0.s);
  for (const sx of [-0.68, 0.68]) for (const yy of [1.2, 2.4])
    sph(0.07, goldM, sx, F0 + yy, D / 2 + 0.25, t0.s);
  const da1 = box(2.2, 0.35, 0.7, frameM, -0.75, F0 + 4.35, D / 2 - 0.1, t0.s); da1.rotation.z = 0.55;
  const da2 = box(2.2, 0.35, 0.7, frameM, 0.75, F0 + 4.35, D / 2 - 0.1, t0.s); da2.rotation.z = -0.55;
  for (let i = 0; i < 3; i++) box(4.2 - i * 0.7, 0.22, 1.1, stoneDarkM, 0, 0.32 - i * 0.2, D / 2 + 0.9 + i * 0.35, t0.s);

  // 扶壁
  const bt = P('buttress', gF0);
  const btM = extM(0xffffff, { map: stoneTex, rough: 0.95 });
  function buttress(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(x, z); bt.add(g);
    box(1.5, 2.4, 1.7, btM, 0, 1.2, 0.5, g);
    box(1.15, 2.2, 1.3, btM, 0, 3.3, 0.15, g);
    const tp = box(0.95, 3.2, 1.0, btM, 0, 5.2, -0.35, g); tp.rotation.x = 0.22;
    box(1.05, 0.55, 1.05, btM, 0, 6.95, -0.72, g);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) buttress(sx * 6.1, sz * 6.1);
  buttress(0, -6.4); buttress(6.4, 0); buttress(-6.4, 0); buttress(-4, 6.4); buttress(4, 6.4);

  // 外墙蜡油（底层）
  function waxCluster(x, y, z, ry, parent) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const wm = extM(0xe6d9bd, { rough: 0.5 });
    box(3.8, 0.4, 0.28, wm, 0, 0.15, 0.03, g).castShadow = false;
    const n = 5 + ((rnd() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const wdt = 0.3 + rnd() * 0.35, h = 0.8 + rnd() * 1.8, px = (rnd() - 0.5) * 3.4;
      sph(wdt, wm, px, -h / 2 + 0.1, 0.06, g, 1, h / (wdt * 2) + 0.6, 0.55).castShadow = false;
      sph(wdt * 1.2, wm, px, 0.12, 0.06, g, 1, 0.7, 0.55).castShadow = false;
    }
  }
  waxCluster(-3.6, F0 + 3.7, D / 2 + 0.05, 0, t0.s);
  waxCluster(3.6, F0 + 3.7, D / 2 + 0.05, 0, t0.s);
  waxCluster(0, F0 + 3.7, -D / 2 - 0.05, Math.PI, t0.n);
  waxCluster(W / 2 + 0.05, F0 + 3.7, 0, Math.PI / 2, t0.e);
  waxCluster(-W / 2 - 0.05, F0 + 3.7, 0, -Math.PI / 2, t0.ww);

  // 屋顶露台
  const tr = P('terrace', gRoof);
  box(W + 1.4, 0.5, D + 1.4, stoneDarkM, 0, ROOF + 0.25, 0, tr);
  const parM = M(0x4a4e55, { map: stoneTex, rough: 0.95 });
  const PH = 1.0, py = ROOF + 0.5 + PH / 2, pe = (W + 1.4) / 2 - 0.18;
  box(W + 1.4, PH, 0.36, parM, 0, py, pe, tr);
  box(W + 1.4, PH, 0.36, parM, 0, py, -pe, tr);
  box(0.36, PH, D + 1.4, parM, pe, py, 0, tr);
  box(0.36, PH, D + 1.4, parM, -pe, py, 0, tr);
  for (let i = -5; i <= 5; i++) {
    box(0.5, 0.45, 0.4, parM, i * 1.25, py + PH / 2 + 0.2, pe, tr);
    box(0.5, 0.45, 0.4, parM, i * 1.25, py + PH / 2 + 0.2, -pe, tr);
    box(0.4, 0.45, 0.5, parM, pe, py + PH / 2 + 0.2, i * 1.25, tr);
    box(0.4, 0.45, 0.5, parM, -pe, py + PH / 2 + 0.2, i * 1.25, tr);
  }

  // 石像鬼
  const gg = P('gargoyle', gRoof);
  function gargoyle(x, z) {
    const g = new THREE.Group(); g.position.set(x, ROOF + 0.5, z);
    g.rotation.y = Math.atan2(x, z); gg.add(g);
    const sm = M(0x3f434b, { rough: 0.95 });
    box(0.35, 0.55, 0.35, sm, 0, 0.28, 0, g);
    box(0.55, 0.75, 0.95, sm, 0, 1.05, 0, g);
    box(0.42, 0.42, 0.55, sm, 0, 1.62, 0.28, g);
    box(0.26, 0.2, 0.4, sm, 0, 1.52, 0.65, g);
    const w1 = box(0.09, 0.95, 0.75, sm, -0.38, 1.5, -0.25, g); w1.rotation.z = 0.55; w1.rotation.x = -0.3;
    const w2 = box(0.09, 0.95, 0.75, sm, 0.38, 1.5, -0.25, g); w2.rotation.z = -0.55; w2.rotation.x = -0.3;
    const t = box(0.16, 0.16, 0.8, sm, 0, 0.9, -0.7, g); t.rotation.x = 0.5;
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) gargoyle(sx * 5.4, sz * 5.4);

  // 尖塔
  const sp = P('spire', gRoof);
  box(4.4, 3.0, 4.4, stoneDarkM, 0, ROOF + 0.5 + 1.5, 0, sp);
  box(5.0, 0.5, 5.0, trimM, 0, ROOF + 0.5 + 3.2, 0, sp);
  cyl(0.12, 2.6, 6.2, M(0x3f434b, { rough: 0.9 }), 0, ROOF + 0.5 + 3.4 + 3.1, 0, sp, 8);
  sph(0.3, goldM, 0, ROOF + 0.5 + 3.4 + 6.2 + 0.25, 0, sp);
  cyl(0.05, 0.05, 1.2, goldM, 0, ROOF + 0.5 + 3.4 + 6.2 + 0.9, 0, sp, 8);
})();

/* ============ 底层室内 ============ */
const floorM = M(0xffffff, { map: floorTex, rough: 0.95 });
const darkWoodM = M(0x3d2a18, { rough: 0.85 });
const waxGlowM = M(0xeadfc2, { rough: 0.45, emissive: 0x6a4a22, ei: 0.35 });

(function buildF0() {
  // 地面
  const hall = P('hall', gF0);
  box(10.8, 0.12, 10.8, floorM, 0, F0 + 0.06, 0, hall);

  // 石柱
  const colM = M(0x565b63, { map: stoneTex, rough: 0.95 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const cx = sx * 3.4, cz = sz * 3.4;
    box(1.3, 0.35, 1.3, colM, cx, F0 + 0.28, cz, hall);
    cyl(0.42, 0.5, H0 - 0.7, colM, cx, F0 + 0.45 + (H0 - 0.7) / 2, cz, hall, 12);
    box(1.25, 0.35, 1.25, colM, cx, F0 + H0 - 0.28, cz, hall);
  }
  // 墙面挂毯
  const banM = M(0xffffff, { map: bannerTex, rough: 0.9 });
  for (const bx of [-3.2, 3.2]) {
    const b1 = box(1.5, 3.4, 0.08, banM, bx, F0 + 2.6, -5.32, hall); b1.castShadow = false;
    box(1.7, 0.12, 0.12, darkWoodM, bx, F0 + 4.35, -5.3, hall);
  }

  // 蜡池
  const wp = P('waxpool', gF0);
  cyl(2.45, 2.55, 0.55, stoneDarkM, -3.2, F0 + 0.27, 0.5, wp, 24);
  const waxTop = cyl(2.1, 2.1, 0.16, waxGlowM, -3.2, F0 + 0.52, 0.5, wp, 24);
  waxTop.castShadow = false;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    sph(0.22 + rnd() * 0.15, waxM, -3.2 + Math.cos(a) * 2.35, F0 + 0.62, 0.5 + Math.sin(a) * 2.35, wp, 1, 0.6, 1).castShadow = false;
  }
  // 浸蜡学者
  function scholar(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, F0, z); g.rotation.y = ry; wp.add(g);
    const robe = M(0x3a3f4a, { rough: 0.95 });
    cyl(0.13, 0.38, 1.35, robe, 0, 0.68, 0, g, 10);
    cyl(0.26, 0.3, 0.2, waxM, 0, 1.32, 0, g, 10);
    sph(0.21, waxM, 0, 1.5, 0, g).castShadow = false;
    box(0.1, 0.7, 0.1, robe, 0.3, 0.75, 0.1, g).rotation.z = -0.4;
  }
  scholar(-1.1, 2.3, -2.2); scholar(-5.2, -0.6, 1.4); scholar(-3.5, 3.4, 3.1);

  // 烛台
  const cd = P('candle', gF0);
  function candel(x, z, hgt) {
    const g = new THREE.Group(); g.position.set(x, F0, z); cd.add(g);
    const im = M(0x2b2b30, { rough: 0.55, metal: 0.55 });
    cyl(0.28, 0.34, 0.14, im, 0, 0.07, 0, g);
    cyl(0.055, 0.075, hgt, im, 0, hgt / 2, 0, g);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const ax = Math.cos(a) * 0.5, az = Math.sin(a) * 0.5;
      const arm = box(0.55, 0.05, 0.05, im, ax / 2, hgt - 0.12, az / 2, g); arm.rotation.y = -a;
      cyl(0.05, 0.05, 0.4, waxM, ax, hgt + 0.05, az, g, 8);
      const f = sph(0.07, flameM, ax, hgt + 0.32, az, g); f.castShadow = false;
    }
    cyl(0.06, 0.06, 0.5, waxM, 0, hgt + 0.1, 0, g, 8);
    const f0 = sph(0.08, flameM, 0, hgt + 0.42, 0, g); f0.castShadow = false;
  }
  candel(3.6, 3.0, 2.3); candel(3.6, -3.0, 2.6); candel(-4.9, 3.8, 2.1);

  // 吊灯链条
  const ch = P('chandelier', gF0);
  (function chandel(x, z) {
    const g = new THREE.Group(); ch.add(g);
    const im = M(0x2b2b30, { rough: 0.55, metal: 0.55 });
    const topY = F0 + H0 - 0.4;
    cyl(0.035, 0.035, 2.4, im, x, topY - 1.2, z, g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 10, 28), im);
    ring.rotation.x = Math.PI / 2; ring.position.set(x, topY - 2.5, z);
    ring.castShadow = true; g.add(ring); tagPart(ring, g);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cx = x + Math.cos(a) * 1.15, cz = z + Math.sin(a) * 1.15;
      cyl(0.05, 0.05, 0.45, waxM, cx, topY - 2.3, cz, g, 8);
      const f = sph(0.07, flameM, cx, topY - 2.0, cz, g); f.castShadow = false;
      const ch2 = cyl(0.015, 0.015, 0.5, im, x + Math.cos(a) * 0.55, topY - 1.35, z + Math.sin(a) * 0.55, g);
      ch2.rotation.z = Math.cos(a) * 0.5; ch2.rotation.x = -Math.sin(a) * 0.5;
    }
    const bowl = cyl(0.5, 0.3, 0.4, im, x, topY - 2.75, z, g, 12);
  })(1.8, -0.5);

  // 石阶（底层 -> 中层）
  const st = P('stair0', gF0);
  const stepM = M(0x565b63, { map: stoneTex, rough: 0.95 });
  const N = 16, rise = (F1 - F0) / N, run = 4.0 / N;
  for (let i = 0; i < N; i++)
    box(3.0, rise + 0.02, run + 0.03, stepM, 0, F0 + (i + 1) * rise - rise / 2, -0.5 - run * (i + 0.5), st);
  for (const sx of [-1.62, 1.62]) {
    const rail = box(0.12, 0.12, 4.6, stoneDarkM, sx, F0 + 3.4, -2.5, st);
    rail.rotation.x = Math.atan2(F1 - F0, 4.0);
    for (let i = 0; i < 4; i++)
      box(0.1, 1.1, 0.1, stoneDarkM, sx, F0 + 0.8 + i * 1.45, -1.1 - i * 1.05, st);
  }
})();

/* ============ 中层 ============ */
function bookshelf(w, h, d, x, y, z, ry, parent) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const sm = M(0x4a3524, { rough: 0.85 });
  box(w, h, d, sm, 0, h / 2, 0, g);
  box(w + 0.15, 0.18, d + 0.1, sm, 0, h + 0.05, 0, g);   // 顶饰
  const cols = [0x7a2e2e, 0x2e4a7a, 0x2e6e4a, 0x8a6a2e, 0x5a2e7a, 0x9a5a2e, 0x3e6e6e];
  const rows = Math.max(2, Math.floor(h / 0.95));
  for (let r = 0; r < rows; r++) {
    const sy = 0.45 + r * 0.95;
    if (sy > h - 0.3) break;
    box(w - 0.12, 0.06, d - 0.08, sm, 0, sy, 0, g);
    let bx = -w / 2 + 0.14;
    while (bx < w / 2 - 0.2) {
      const bw = 0.09 + rnd() * 0.08, bh = 0.5 + rnd() * 0.28;
      box(bw, bh, d - 0.22, M(cols[(rnd() * 7) | 0], { rough: 0.9 }), bx + bw / 2, sy + 0.03 + bh / 2, 0, g);
      bx += bw + 0.015;
      if (rnd() > 0.92) bx += 0.12;  // 偶尔空一格
    }
  }
  return g;
}
function railing(x1, z1, x2, z2, y0, parent) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const rm = M(0x2b2b30, { rough: 0.55, metal: 0.55 });
  const horiz = Math.abs(x2 - x1) > Math.abs(z2 - z1);
  if (horiz) box(len, 0.07, 0.07, rm, cx, y0 + 0.95, cz, parent);
  else box(0.07, 0.07, len, rm, cx, y0 + 0.95, cz, parent);
  const n = Math.max(2, Math.round(len / 1.1));
  for (let i = 0; i <= n; i++) {
    const px = x1 + ((x2 - x1) * i) / n, pz = z1 + ((z2 - z1) * i) / n;
    box(0.06, 0.95, 0.06, rm, px, y0 + 0.48, pz, parent);
  }
}

(function buildF1() {
  // 楼板（中央天井 + 北侧楼梯口留洞）
  const slabM = floorM;
  const sy = F1 - 0.2;
  box(12, 0.4, 3, slabM, 0, sy, 4.5, P('stacks', gMid));            // 南
  box(12, 0.4, 1.2, slabM, 0, sy, -5.4, P('stacks', gMid));        // 北沿
  box(4.3, 0.4, 1.8, slabM, -3.85, sy, -3.9, P('stacks', gMid));   // 楼梯口西
  box(4.3, 0.4, 1.8, slabM, 3.85, sy, -3.9, P('stacks', gMid));    // 楼梯口东
  box(3, 0.4, 6, slabM, -4.5, sy, 0, P('stacks', gMid));           // 天井西
  box(3, 0.4, 6, slabM, 4.5, sy, 0, P('stacks', gMid));           // 天井东

  // 天井护栏（北侧留楼梯缺口）
  const st = P('stacks', gMid);
  railing(-3, 3, 3, 3, F1, st);
  railing(-3, -3, -3, 3, F1, st);
  railing(3, -3, 3, 3, F1, st);
  railing(-3, -3, -1.7, -3, F1, st);
  railing(1.7, -3, 3, -3, F1, st);

  // 环形书架（沿墙）
  for (const bx of [-3.8, 0, 3.8]) bookshelf(2.4, 3.8, 0.7, bx, F1, -5.0, 0, st);
  for (const bx of [-3.8, 0, 3.8]) bookshelf(2.4, 3.8, 0.7, bx, F1, 5.0, Math.PI, st);
  for (const bz of [-1.8, 1.8]) bookshelf(2.4, 3.8, 0.7, 5.0, F1, bz, -Math.PI / 2, st);
  for (const bz of [-1.8, 1.8]) bookshelf(2.4, 3.8, 0.7, -5.0, F1, bz, Math.PI / 2, st);
  // 梯子
  for (const bx of [-2.6, 2.6]) {
    const lad = box(0.5, 3.6, 0.08, darkWoodM, bx, F1 + 1.8, -4.6, st);
    lad.rotation.x = 0.12;
  }

  // 旋转书架楼梯（中央天井内，F1 -> F2）
  const sp = P('spiral', gMid);
  const spStone = M(0x565b63, { map: stoneTex, rough: 0.95 });
  cyl(0.62, 0.72, H1 + 1.2, spStone, 0, F1 + (H1 + 1.2) / 2 - 0.3, 0, sp, 16);
  const SN = 26, turns = 1.75;
  for (let i = 0; i < SN; i++) {
    const a = (i / SN) * turns * Math.PI * 2;
    const y = F1 + 0.25 + ((i + 0.5) / SN) * (F2 - F1 - 0.3);
    const px = Math.cos(a) * 1.55, pz = Math.sin(a) * 1.55;
    const step = box(1.5, 0.16, 0.85, spStone, px, y, pz, sp);
    step.rotation.y = -a + Math.PI / 2;
  }
  // 螺旋外侧小书架
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.35;
    const px = Math.cos(a) * 2.35, pz = Math.sin(a) * 2.35;
    const y = F1 + 0.2 + (k / 8) * (F2 - F1 - 1.2);
    bookshelf(1.1, 2.3, 0.5, px, y, pz, -a + Math.PI / 2, sp);
  }
  // 顶部吊链
  cyl(0.04, 0.04, 3.0, M(0x2b2b30, { metal: 0.55, rough: 0.5 }), 0, F2 + 2.2, 0, sp);

  // 学者书桌
  const sc = P('scholar', gMid);
  function desk(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, F1, z); g.rotation.y = ry; sc.add(g);
    const wm = M(0x4a3524, { rough: 0.85 });
    box(1.7, 0.09, 0.95, wm, 0, 0.76, 0, g);
    for (const sx of [-0.75, 0.75]) for (const sz of [-0.38, 0.38])
      box(0.09, 0.72, 0.09, wm, sx, 0.36, sz, g);
    box(0.5, 0.07, 0.4, wm, 0, 0.42, 0, g);   // 椅面
    box(0.5, 0.7, 0.07, wm, 0, 0.75, -0.42, g);
    for (const sx of [-0.2, 0.2]) for (const sz of [-0.15, 0.15])
      box(0.06, 0.42, 0.06, wm, sx, 0.21, sz, g);
    for (let i = 0; i < 3; i++)   // 书堆
      box(0.42 - i * 0.05, 0.09, 0.32, M([0x7a2e2e, 0x2e4a7a, 0x8a6a2e][i], { rough: 0.9 }), -0.45, 0.85 + i * 0.09, 0.1, g, (rnd() - 0.5) * 0.3);
    cyl(0.045, 0.045, 0.32, waxM, 0.45, 0.95, -0.15, g, 8);   // 蜡烛
    const f = sph(0.06, flameM, 0.45, 1.16, -0.15, g); f.castShadow = false;
    box(0.3, 0.02, 0.4, M(0xd8cbaa, { rough: 0.9 }), 0.1, 0.82, 0.15, g, 0.2);  // 摊开的书页
  }
  desk(4.3, -3.2, -Math.PI / 2);
  desk(-4.3, 3.2, Math.PI / 2);
  desk(-4.3, -3.4, Math.PI / 2);
})();

/* ============ 顶层：双王子王座厅 ============ */
(function buildF2() {
  // 楼板（中央留洞，旋转楼梯穿过）
  const sy = F2 - 0.2;
  box(12, 0.4, 3, floorM, 0, sy, 4.5, P('throne', gTop));
  box(12, 0.4, 3, floorM, 0, sy, -4.5, P('throne', gTop));
  box(3, 0.4, 6, floorM, -4.5, sy, 0, P('throne', gTop));
  box(3, 0.4, 6, floorM, 4.5, sy, 0, P('throne', gTop));

  const th = P('throne', gTop);
  railing(-3, 3, 3, 3, F2, th);
  railing(-3, -3, 3, -3, F2, th);
  railing(-3, -3, -3, 3, F2, th);
  railing(3, -3, 3, 3, F2, th);

  // 王座
  function throne(x, big) {
    const g = new THREE.Group(); g.position.set(x, F2, -4.1); th.add(g);
    const sm = M(0x2e3138, { rough: 0.8 });
    const s = big ? 1 : 0.68;
    box(1.5 * s, 0.55, 1.25 * s, sm, 0, 0.28, 0, g);
    box(1.6 * s, (big ? 3.4 : 2.4), 0.38, sm, 0, (big ? 1.7 : 1.2) + 0.5, -0.6 * s, g);
    box(1.7 * s, 0.2, 0.45, goldM, 0, (big ? 3.55 : 2.55), -0.6 * s, g);
    for (const sx of [-0.78, 0.78])
      sph(0.14 * s + 0.04, goldM, sx * s, (big ? 3.55 : 2.55) + 0.14, -0.6 * s, g);
    box(1.25 * s, 0.35, 1.05 * s, M(0x5e1a24, { rough: 0.9 }), 0, 0.68, 0.05, g);
    for (const sx of [-0.62, 0.62]) box(0.26 * s, 0.95, 1.15 * s, sm, sx * s, 0.72, 0, g);
    if (big) {  // 洛里安的大剑靠在王座旁
      const sw = box(0.16, 2.6, 0.05, M(0x8a8f96, { metal: 0.7, rough: 0.35 }), 1.0 * s, 1.3, -0.3, g);
      sw.rotation.z = 0.28;
      box(0.5, 0.1, 0.08, goldM, 0.62 * s, 0.35, -0.3, g).rotation.z = 0.28;
    }
  }
  throne(-1.35, true);
  throne(1.35, false);

  // 红毯
  box(2.3, 0.06, 9.5, M(0x5e1a24, { rough: 0.95 }), 0, F2 + 0.05, 0.6, th);
  // 王座厅烛台
  const im = M(0x2b2b30, { rough: 0.55, metal: 0.55 });
  for (const sx of [-3.6, 3.6]) {
    const g = new THREE.Group(); g.position.set(sx, F2, 2.6); th.add(g);
    cyl(0.28, 0.34, 0.14, im, 0, 0.07, 0, g);
    cyl(0.055, 0.075, 2.6, im, 0, 1.3, 0, g);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const ax = Math.cos(a) * 0.5, az = Math.sin(a) * 0.5;
      const arm = box(0.55, 0.05, 0.05, im, ax / 2, 2.48, az / 2, g); arm.rotation.y = -a;
      cyl(0.05, 0.05, 0.4, waxM, ax, 2.65, az, g, 8);
      const f = sph(0.07, flameM, ax, 2.92, az, g); f.castShadow = false;
    }
  }
  // 挂毯
  const banM = M(0xffffff, { map: bannerTex, rough: 0.9 });
  for (const bx of [-2.9, 2.9]) {
    const b = box(1.6, 3.8, 0.08, banM, bx, F2 + 2.8, -5.32, th); b.castShadow = false;
    box(1.8, 0.12, 0.12, darkWoodM, bx, F2 + 4.75, -5.3, th);
  }
  for (const sz of [-1.8, 1.8]) {
    const b1 = box(0.08, 3.8, 1.6, banM, 5.32, F2 + 2.8, sz, th); b1.castShadow = false;
    const b2 = box(0.08, 3.8, 1.6, banM, -5.32, F2 + 2.8, sz, th); b2.castShadow = false;
  }

  // 落地大窗（独立部件）
  const wn = P('windows', gTop);
  const glassM2 = M(0x9fc4e8, { rough: 0.2, metal: 0.1, transparent: true, opacity: 0.5, emissive: 0x2a4a66, ei: 0.35 });
  const frameM2 = M(0x3a3e45, { rough: 0.85 });
  function bigWin(w, h, x, y, z, ry) {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; wn.add(grp);
    box(w + 0.4, h, 0.45, frameM2, 0, h / 2, 0, grp);
    const gl = box(w, h - 0.3, 0.14, glassM2, 0, h / 2, 0.07, grp); gl.castShadow = false;
    box(0.1, h - 0.3, 0.16, frameM2, 0, h / 2, 0.08, grp);
    for (const fy of [0.3, 0.55, 0.78]) box(w, 0.1, 0.16, frameM2, 0, h * fy, 0.08, grp);
    box(w + 0.6, 0.2, 0.55, frameM2, 0, -0.06, 0.02, grp);
    const aw = Math.hypot(w / 2 + 0.2, 1.1);
    const a1 = box(aw, 0.3, 0.45, frameM2, -(w / 4 + 0.1), h + 0.4, 0, grp); a1.rotation.z = 0.5;
    const a2 = box(aw, 0.3, 0.45, frameM2, (w / 4 + 0.1), h + 0.4, 0, grp); a2.rotation.z = -0.5;
  }
  for (const x of [-3.5, 0, 3.5]) bigWin(2.1, 3.8, x, F2 + 0.7, D / 2 + 0.02, 0);
  for (const z of [-2, 2]) bigWin(2.1, 3.8, W / 2 + 0.02, F2 + 0.7, z, Math.PI / 2);
  for (const z of [-2, 2]) bigWin(2.1, 3.8, -W / 2 - 0.02, F2 + 0.7, z, -Math.PI / 2);
})();

/* ============ 塔外：庭院、篝火、枯树 ============ */
(function buildYard() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), M(0xffffff, { map: ashTex, rough: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  // 前院石板（无部件归属，仅装饰）
  const yard = new THREE.Group(); scene.add(yard);
  box(13, 0.12, 9, stoneDarkM, 0, 0.06, 10.5, yard);

  const bf = P('bonfire', scene);
  // 灰烬堆
  sph(0.95, M(0x6a655c, { rough: 1 }), 7, 0.28, 9, bf, 1, 0.55, 1);
  sph(0.6, M(0x7d786e, { rough: 1 }), 7.3, 0.35, 8.7, bf, 1, 0.5, 1);
  // 螺旋剑
  const sword = box(0.14, 1.7, 0.05, M(0x8a8f96, { metal: 0.7, rough: 0.35 }), 7, 1.05, 9, bf);
  sword.rotation.z = 0.45; sword.rotation.x = 0.15;
  box(0.4, 0.08, 0.08, goldM, 6.72, 0.42, 8.95, bf).rotation.z = 0.45;
  // 柴堆
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.2;
    const stick = cyl(0.05, 0.06, 1.1, darkWoodM, 7 + Math.cos(a) * 0.25, 0.55, 9 + Math.sin(a) * 0.25, bf, 8);
    stick.rotation.z = Math.cos(a) * 0.6; stick.rotation.x = -Math.sin(a) * 0.6;
  }
  // 火焰
  const fl1 = cyl(0.03, 0.38, 1.0, flameM, 7, 1.05, 9, bf, 10); fl1.castShadow = false;
  const fl2 = cyl(0.02, 0.22, 0.7, M(0xffc46a, { emissive: 0xff9a2e, ei: 2.8, rough: 0.6 }), 7, 1.0, 9, bf, 10); fl2.castShadow = false;

  // 枯树
  function deadTree(x, z, s) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const tm = M(0x2e2a24, { rough: 1 });
    const trunk = cyl(0.14 * s, 0.26 * s, 3.2 * s, tm, 0, 1.6 * s, 0, g, 8);
    trunk.rotation.z = 0.08;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const br = cyl(0.04 * s, 0.08 * s, 1.6 * s, tm, Math.cos(a) * 0.5 * s, (2.6 + (i % 2) * 0.5) * s, Math.sin(a) * 0.5 * s, g, 6);
      br.rotation.z = Math.cos(a) * 0.9; br.rotation.x = -Math.sin(a) * 0.9;
    }
  }
  deadTree(-8.5, 7.5, 1.1); deadTree(10, 4.5, 0.85); deadTree(-9, -4, 1.0);
  // 碎石
  for (let i = 0; i < 10; i++) {
    const a = rnd() * Math.PI * 2, r = 8 + rnd() * 4;
    sph(0.25 + rnd() * 0.4, stoneDarkM, Math.cos(a) * r, 0.12, Math.sin(a) * r, yard, 1, 0.55, 1);
  }
})();

/* ============ 交互 ============ */
const view = document.getElementById('view');
const panel = document.getElementById('panel');
const labelWrap = document.getElementById('labels');
const infoEl = document.getElementById('info');
const infoName = document.getElementById('infoName');
const infoCat = document.getElementById('infoCat');
const infoDesc = document.getElementById('infoDesc');
let viewW = 800, viewH = 600;
let cur = 'exterior', selected = null, labelsOn = true;
let fly = null, hlBox = null;
const tmpBox = new THREE.Box3();
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function flyTo(pos, tgt) { fly = { pos: pos.clone(), tgt: tgt.clone() }; }
controls.addEventListener('start', () => { fly = null; });

// 部件列表
const partsWrap = document.getElementById('parts');
for (const ck of ['out', 'f0', 'f1', 'f2']) {
  const h = document.createElement('div'); h.className = 'cat'; h.textContent = CATS[ck];
  partsWrap.appendChild(h);
  for (const id in PARTS) {
    const p = PARTS[id];
    if (p.cat !== ck) continue;
    const b = document.createElement('button');
    b.className = 'pbtn'; b.dataset.part = id; b.textContent = p.name;
    b.onclick = () => selectPart(id);
    partsWrap.appendChild(b);
  }
}

// 视角模式
function setMode(m) {
  cur = m;
  document.querySelectorAll('.vbtn').forEach(b => b.classList.toggle('on', b.dataset.view === m));
  gRoof.visible = (m === 'exterior');
  // 内部视角：隐藏南+东外墙，做娃娃屋剖面，纵览三层
  const cut = (m === 'interior');
  cutWalls.w0s.visible = !cut; cutWalls.w0e.visible = !cut;
  cutWalls.w1s.visible = !cut; cutWalls.w1e.visible = !cut;
  cutWalls.w2s.visible = !cut; cutWalls.w2e.visible = !cut;
  PARTS['windows'].group.visible = !cut;   // 落地大窗挂在南/东墙上
  const xray = (m === 'xray');
  extMats.forEach(mt => { mt.transparent = xray; mt.opacity = xray ? 0.13 : 1; mt.depthWrite = !xray; mt.needsUpdate = true; });
  if (m === 'exterior') flyTo(V(21, 14, 25), V(0, 9, 0));
  if (m === 'interior') flyTo(V(20, 15, 27), V(0, 8, 0));
  if (m === 'xray') flyTo(V(23, 17, 23), V(0, 8, 0));
}
document.querySelectorAll('.vbtn').forEach(b => b.onclick = () => setMode(b.dataset.view));

// 开关
const tLabels = document.getElementById('tLabels');
tLabels.onclick = () => { labelsOn = !labelsOn; tLabels.classList.toggle('on', labelsOn); };
const tRotate = document.getElementById('tRotate');
tRotate.onclick = () => { controls.autoRotate = !controls.autoRotate; tRotate.classList.toggle('on', controls.autoRotate); };
document.getElementById('explode').addEventListener('input', e => {
  const t = e.target.value / 100;
  gRoof.position.y = 7 * t;
  gTop.position.y = 4.5 * t;
  gMid.position.y = 2.2 * t;
});
document.getElementById('menuBtn').onclick = () => { panel.classList.toggle('hide'); setTimeout(onResize, 260); };
document.getElementById('infoX').onclick = () => infoEl.classList.remove('show');

// 选择部件
function ensureVisible(p) {
  const L = p.layer;
  if (L === 'roof') { if (cur !== 'exterior') setMode('exterior'); return; }
  if (L === 'yard') return;
  if (p.id === 'windows' && cur === 'interior') { setMode('exterior'); return; }
  if (p.xray && cur === 'exterior') setMode('interior');
}
function clearHl() {
  if (hlBox) { scene.remove(hlBox); hlBox.geometry.dispose(); hlBox.material.dispose(); hlBox = null; }
}
function selectPart(id) {
  const p = PARTS[id];
  if (!p || !p.group) return;
  ensureVisible(p);
  selected = id;
  document.querySelectorAll('.pbtn').forEach(b => b.classList.toggle('on', b.dataset.part === id));
  document.querySelectorAll('.lbl').forEach(el => el.classList.toggle('hot', el.dataset.part === id));
  infoName.textContent = p.name;
  const layerName = { roof: ' · 塔顶', top: ' · 顶层', mid: ' · 中层', f0: ' · 底层', yard: ' · 塔外' }[p.layer] || '';
  infoCat.textContent = CATS[p.cat] + layerName;
  infoDesc.textContent = p.desc;
  infoEl.classList.add('show');
  p.group.updateWorldMatrix(true, true);
  tmpBox.setFromObject(p.group);
  if (!tmpBox.isEmpty()) {
    const c = tmpBox.getCenter(new THREE.Vector3());
    const size = tmpBox.getSize(new THREE.Vector3()).length();
    const dir = V(...(p.viewDir || [1, 0.6, 1])).normalize();
    flyTo(c.clone().addScaledVector(dir, Math.max(3, size * 1.4)), c);
  }
  clearHl();
  hlBox = new THREE.Box3Helper(tmpBox, 0xff8c2e);
  hlBox.material.depthTest = false;
  hlBox.renderOrder = 999;
  scene.add(hlBox);
}
function clearSelection() {
  selected = null; clearHl();
  infoEl.classList.remove('show');
  document.querySelectorAll('.pbtn').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.lbl').forEach(el => el.classList.remove('hot'));
}

// 点击射线拾取
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let downX = 0, downY = 0;
canvas.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY; });
canvas.addEventListener('pointerup', e => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  const r = canvas.getBoundingClientRect();
  ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(scene.children, true);
  for (const h of hits) {
    let n = h.object;
    while (n) {
      if (n.userData && n.userData.partId) { selectPart(n.userData.partId); return; }
      n = n.parent;
    }
  }
  clearSelection();
});

// 标注
const labelEls = [];
for (const id in PARTS) {
  const p = PARTS[id];
  if (p.noLabel || !p.label) continue;
  const el = document.createElement('div');
  el.className = 'lbl'; el.textContent = p.name; el.dataset.part = id;
  el.style.display = 'none';
  labelWrap.appendChild(el);
  labelEls.push({ id, el, v: V(...p.label) });
}
function isShown(obj) { let n = obj; while (n) { if (!n.visible) return false; n = n.parent; } return true; }
const pv = new THREE.Vector3();
function refreshLabels() {
  for (const { id, el, v } of labelEls) {
    const p = PARTS[id];
    // 室内部件标注只在能看到室内的视角下显示，避免穿墙
    const showXray = cur === 'xray' || cur === 'interior';
    if (!labelsOn || !isShown(p.group) || (p.xray && !showXray)) { el.style.display = 'none'; continue; }
    pv.copy(v).applyMatrix4(p.group.matrixWorld).project(camera);
    if (pv.z > 1 || pv.z < -1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((pv.x * 0.5 + 0.5) * viewW) + 'px';
    el.style.top = ((-pv.y * 0.5 + 0.5) * viewH) + 'px';
  }
}

// 自适应
function onResize() {
  viewW = view.clientWidth; viewH = view.clientHeight;
  renderer.setSize(viewW, viewH, false);
  camera.aspect = viewW / viewH;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// 主循环
function animate() {
  requestAnimationFrame(animate);
  if (fly) {
    camera.position.lerp(fly.pos, 0.07);
    controls.target.lerp(fly.tgt, 0.07);
    if (camera.position.distanceTo(fly.pos) < 0.06) fly = null;
  }
  controls.update();
  if (selected && hlBox && PARTS[selected].group) tmpBox.setFromObject(PARTS[selected].group);
  refreshLabels();
  renderer.render(scene, camera);
}

onResize();
setMode('exterior');
animate();
document.getElementById('loading').style.display = 'none';
