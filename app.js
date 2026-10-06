import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============ 基础场景 ============ */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2b3442);
scene.fog = new THREE.Fog(0x2b3442, 60, 130);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 400);
camera.position.set(34, 24, 40);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 10, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 2;
controls.maxDistance = 90;
controls.autoRotateSpeed = 1.0;

const hemi = new THREE.HemisphereLight(0x99a7c0, 0x554a3c, 1.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b8, 2.1);
sun.position.set(20, 30, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -26; sun.shadow.camera.right = 26;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0006;
scene.add(sun);

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
let _s = 29;
function rnd() { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; }

const stoneTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#7d7a72'; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 42) for (let x = 0; x < s; x += 64) {
    const ox = (y / 42 % 2) * 32;
    g.fillStyle = `rgb(${118 + rnd() * 22 | 0},${114 + rnd() * 20 | 0},${104 + rnd() * 18 | 0})`;
    g.fillRect(x + ox - 32, y + 2, 60, 38);
  }
  g.strokeStyle = 'rgba(40,38,34,.7)'; g.lineWidth = 3;
  for (let y = 0; y <= s; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(50,48,44,.28)' : 'rgba(200,195,180,.18)';
    g.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 3, 2 + rnd() * 3);
  }
}, 3, 2);
const darkStoneTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#4e4c48'; g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 52) for (let x = 0; x < s; x += 78) {
    const ox = (y / 52 % 2) * 39;
    g.fillStyle = `rgb(${72 + rnd() * 16 | 0},${70 + rnd() * 14 | 0},${66 + rnd() * 12 | 0})`;
    g.fillRect(x + ox - 39, y + 2, 74, 48);
  }
  g.strokeStyle = 'rgba(20,18,16,.8)'; g.lineWidth = 3;
  for (let y = 0; y <= s; y += 52) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
  for (let i = 0; i < 700; i++) {
    g.fillStyle = 'rgba(15,14,12,.3)';
    g.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 4, 2 + rnd() * 4);
  }
}, 3, 2);
const woodTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#4a3423'; g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 32) {
    g.fillStyle = `rgba(${60 + rnd() * 25 | 0},${38 + rnd() * 16 | 0},20,.5)`;
    g.fillRect(x, 0, 30, s);
    g.strokeStyle = 'rgba(20,12,6,.6)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s); g.stroke();
  }
}, 2, 2);
const paperTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#cbb98f'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(90,70,40,.5)'; g.lineWidth = 1;
  for (let y = 12; y < s; y += 10) { g.beginPath(); g.moveTo(8, y); g.lineTo(s - 8, y); g.stroke(); }
  for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(120,95,55,.25)'; g.fillRect(rnd() * s, rnd() * s, 2, 2); }
});
const waxTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#e8ddc4'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${200 + rnd() * 40 | 0},${185 + rnd() * 35 | 0},${150 + rnd() * 30 | 0},.6)`;
    const x = rnd() * s;
    g.fillRect(x, 0, 3 + rnd() * 5, rnd() * s);
  }
}, 2, 2);
const carpetTex = canvasTex(128, (g, s) => {
  g.fillStyle = '#7a1e1e'; g.fillRect(0, 0, s, s);
  g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(6, 6, s - 12, s - 12);
  g.strokeStyle = 'rgba(201,162,74,.5)'; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) { g.strokeRect(18 + i * 8, 18 + i * 8, s - 36 - i * 16, s - 36 - i * 16); }
}, 1, 4);
const groundTex = canvasTex(256, (g, s) => {
  g.fillStyle = '#3d3a35'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = rnd() > .5 ? 'rgba(25,23,20,.5)' : 'rgba(90,85,75,.35)';
    g.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 3, 2 + rnd() * 3);
  }
}, 16, 16);

/* ============ 材质与建模助手 ============ */
function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.92, metalness: o.metal ?? 0,
    map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    side: o.side || THREE.FrontSide
  });
}
const extMats = [];
function extM(color, o = {}) { const m = M(color, o); extMats.push(m); return m; }

function tagPart(mesh, parent) {
  let n = parent;
  while (n) {
    if (n.userData && n.userData.isPart) { mesh.userData.partId = n.userData.partId; break; }
    n = n.parent;
  }
}
function box(w, h, d, material, x, y, z, parent, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m); tagPart(m, parent);
  return m;
}
function cyl(rt, rb, h, material, x, y, z, parent, seg = 14) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m); tagPart(m, parent);
  return m;
}
function cone(r, h, material, x, y, z, parent, seg = 12) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m); tagPart(m, parent);
  return m;
}
function sph(r, material, x, y, z, parent, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), material);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m); tagPart(m, parent);
  return m;
}
function torus(r, t, material, x, y, z, parent, rx = 0, seg = 20) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, seg), material);
  m.position.set(x, y, z); m.rotation.x = rx;
  m.castShadow = m.receiveShadow = true;
  (parent || scene).add(m); tagPart(m, parent);
  return m;
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
const CATS = { out: '外部', l1: '一层 · 入口', l2: '二层 · 蜡池厅', l3: '三层 · 藏书廊', l4: '顶层 · 王座厅', roof: '屋顶', yard: '庭院' };
function defPart(id, meta) { PARTS[id] = Object.assign({ id, group: null }, meta); }
function P(id, parent) {
  const g = new THREE.Group();
  g.userData.isPart = true; g.userData.partId = id;
  PARTS[id].group = g;
  (parent || scene).add(g);
  return g;
}

defPart('wall-l1',   { name: '一层外墙', cat: 'out', layer: 'l1', label: [-9.4, 2.5, 2], viewDir: [-1, .45, .7], desc: '底层石墙，厚得能挡住一切好奇心——除了不死人的。岁月把石块啃得坑坑洼洼。' });
defPart('wall-l2',   { name: '二层外墙', cat: 'out', layer: 'l2', label: [9.4, 7.5, -2], viewDir: [1, .45, -.6], desc: '二层外墙。蜡从上层的窗缝里渗出来，沿着墙面凝固成白色的"眼泪"。' });
defPart('wall-l3',   { name: '三层外墙', cat: 'out', layer: 'l3', label: [-9.4, 13, -2], viewDir: [-1, .5, -.5], desc: '三层外墙，开着高大的尖拱窗。晚上从外面看，里面烛火通明——但最好别进去。' });
defPart('wall-l4',   { name: '顶层外墙', cat: 'out', layer: 'l4', label: [6.4, 18.5, 0], viewDir: [1, .5, .5], desc: '顶层收分的外墙。双王子的王座厅就在里面，是整座书库最接近天空的地方。' });
defPart('buttress',  { name: '扶壁群', cat: 'out', layer: 'l2', label: [9.9, 8, 5], viewDir: [1, .5, .8], desc: '哥特式扶壁，撑起高耸塔楼的石之肋骨。没有它们，书库早就在岁月里塌了。' });
defPart('waxwall',   { name: '蜡封外墙', cat: 'out', layer: 'l1', label: [-5, 3.2, 7.4], viewDir: [-.5, .5, 1], desc: '底层外墙上凝固的蜡油。学者们把蜡涂得到处都是，仿佛整座建筑都在"出汗"。' });
defPart('courtyard', { name: '入口庭院', cat: 'yard', layer: 'ground', label: [0, 1.2, 12], viewDir: [.3, .6, 1], desc: '书库正门前的石砌庭院。猎龙铠甲倒在不远处，而这里，是通往知识地狱的起点。' });
defPart('gate-stairs',{ name: '入口石阶', cat: 'yard', layer: 'ground', label: [-4.5, 1, 9.5], viewDir: [-.6, .5, 1], desc: '宽阔的石阶拾级而上。台阶被无数双脚磨得发亮——大多是来送死的脚。' });
defPart('bonfire',   { name: '篝火台', cat: 'yard', layer: 'ground', label: [5.5, 1.6, 10.5], viewDir: [.8, .5, .8], desc: '大书库篝火。点燃它吧——接下来的路很长，捷径很少，诅咒很多。' });
defPart('statue',    { name: '庭院雕像', cat: 'yard', layer: 'ground', label: [0, 2.6, 13.5], viewDir: [0, .5, 1], desc: '庭院中央的骑士雕像，无名无姓，像在为什么守灵。' });
defPart('terrace-e', { name: '东屋顶露台', cat: 'out', layer: 'l3', label: [10.5, 17.2, 0], viewDir: [1, .6, .4], desc: '东侧屋顶露台。从高处缺口翻出来就能到这里，石像鬼喜欢在这里"迎接"客人。' });
defPart('terrace-w', { name: '西屋顶露台', cat: 'out', layer: 'l3', label: [-10.5, 17.2, 0], viewDir: [-1, .6, .4], desc: '西侧屋顶露台。旁边的小塔爬上去能拿到猎人戒指——如果你够得到梯子。' });
defPart('gargoyle',  { name: '石像鬼', cat: 'out', layer: 'l3', label: [10.5, 18.6, -4], viewDir: [1, .5, -.5], desc: '石像鬼。它们是雕像——直到你走近。屋顶上那几只会飞下来，记得带够血瓶。' });
defPart('spire',     { name: '尖塔', cat: 'roof', layer: 'roof', label: [0, 26.5, 0], viewDir: [1, .6, 1], desc: '八角尖塔直指天空，是洛斯里克城最高的知识灯塔——也是诅咒最浓的地方。' });
defPart('tower-ladder',{ name: '猎人戒指小塔', cat: 'roof', layer: 'roof', label: [-10.5, 20.5, -3], viewDir: [-1, .5, -.6], desc: '西露台旁的小塔。爬上木梯，猎人戒指在塔顶等你——以及不错的狙击位。' });
defPart('beams-cage',{ name: '横梁牢笼区', cat: 'roof', layer: 'roof', label: [8, 19.5, 5], viewDir: [1, .6, .8], desc: '屋顶破洞下的横梁与铁笼。从这里跳下去，能摸到奇迹"神圣光柱"——如果你胆子够大。' });
defPart('gate-double',{ name: '双开大门', cat: 'l1', layer: 'l1', label: [0, 2.8, 7.3], viewDir: [0, .4, 1], desc: '没有"大书库钥匙"，这扇门纹丝不动。而钥匙，要用三位薪王的余烬来换。' });
defPart('hall-entry',{ name: '入口大厅', cat: 'l1', layer: 'l1', xray: 1, label: [0, 3, -1], viewDir: [.8, .8, 1], desc: '穿过大门，结晶老者在这里"迎接"你。他打不过就会瞬移跑路，别追，追不上的。' });
defPart('stair-l1',  { name: '一层石梯', cat: 'l1', layer: 'l1', xray: 1, noLabel: 1, desc: '大厅北端的石梯，通往二层。每一步都踩在灰尘和书页上。' });
defPart('waxpool',   { name: '蜡池', cat: 'l2', layer: 'l2', xray: 1, label: [5.5, 7.6, -2], viewDir: [1, .6, -.4], desc: '"把头浸入蜡中"——大书库代代相传的土办法。顶着一脑袋蜡，书中伸出的诅咒之手就奈何不了你。' });
defPart('altar',     { name: '祭坛', cat: 'l2', layer: 'l2', xray: 1, label: [0, 7.2, -5], viewDir: [0, .7, -1], desc: '蜡池厅北端的祭坛。蜡覆祭司们曾在这里"布道"，现在只剩下蜡和灰。' });
defPart('priest-wax',{ name: '蜡覆祭司', cat: 'l2', layer: 'l2', xray: 1, label: [-4.5, 6.8, -1], viewDir: [-1, .6, 0], desc: '浑身裹满蜡的祭司，蜡是他们的铠甲，也是他们的棺材。' });
defPart('lever-shelf',{ name: '书架机关拉杆', cat: 'l2', layer: 'l2', xray: 1, label: [-7, 6.8, 2], viewDir: [-1, .6, .5], desc: '拉下拉杆，书架滑开，密室露出——女巫的发饰和咒术"内在潜力"就藏在这种地方。魂系传统艺能。' });
defPart('stair-l2',  { name: '二层石梯', cat: 'l2', layer: 'l2', xray: 1, noLabel: 1, desc: '通往三层藏书廊的石梯。越往上，书越多，手也越多。' });
defPart('lift',      { name: '快捷升降机', cat: 'l2', layer: 'l2', xray: 1, label: [8.2, 7.5, 4], viewDir: [1, .6, .6], desc: '直通一层的升降机。拉闸开门，回到入口——这是贯穿全关最重要的捷径，千万别错过。' });
defPart('gallery',   { name: '藏书长廊', cat: 'l3', layer: 'l3', xray: 1, label: [0, 13.5, 0], viewDir: [1, .9, 1], desc: '挑高的藏书长廊，书架顶到天花板。学者们在这里游荡，寻找早已失传的秘密。' });
defPart('shelves',   { name: '高大书架群', cat: 'l3', layer: 'l3', xray: 1, label: [-6.5, 13, 3], viewDir: [-1, .7, .6], desc: '顶天立地的书架，塞满了书。有些书里，会伸出手来。' });
defPart('shelf-slide',{ name: '滑动书架', cat: 'l3', layer: 'l3', xray: 1, label: [6.5, 12.5, -3], viewDir: [1, .7, -.5], desc: '又一处机关书架。拉杆在附近，宝箱在书架后面——楔形石块在向你招手。' });
defPart('curse-hands',{ name: '诅咒之手', cat: 'l3', layer: 'l3', xray: 1, label: [-2, 12.5, -5.5], viewDir: [-.4, .7, -1], desc: '从书页和墙缝里伸出的鬼手。没浸蜡就被它们摸到，诅咒条涨得比血条还快。' });
defPart('balcony',   { name: '回廊阳台', cat: 'l3', layer: 'l3', xray: 1, label: [0, 14.8, 6.2], viewDir: [.5, .8, 1], desc: '长廊两侧的回廊阳台，可以俯视整个大厅——也是被鬼手摸到的好地方。' });
defPart('chandelier',{ name: '吊灯', cat: 'l3', layer: 'l3', xray: 1, label: [0, 15.2, 0], viewDir: [.6, .5, .8], desc: '铁环吊灯，烛火长明。没人添油，但它从不熄灭——别问，问就是薪火。' });
defPart('desk-scholar',{ name: '学者书桌', cat: 'l3', layer: 'l3', xray: 1, label: [4, 11.5, 4.5], viewDir: [1, .7, 1], desc: '学者的书桌：书堆、蜡烛、羽毛笔。他们研究了一辈子，最后都变成了游魂。' });
defPart('stair-spiral',{ name: '旋转楼梯', cat: 'l3', layer: 'l3', xray: 1, label: [-3.5, 13.5, -1], viewDir: [-.8, .8, -.6], desc: '长廊中央的环形大楼梯，盘旋而上连接各层。跑图时可以在这里把追兵耍得团团转。' });
defPart('corridor',  { name: '王座长廊', cat: 'l4', layer: 'l4', xray: 1, label: [0, 18.5, 1], viewDir: [.7, .8, 1], desc: '穿过双开大门，红毯直通王座。洛斯里克的王子们，就在前面等你。' });
defPart('throne',    { name: '双王子王座', cat: 'l4', layer: 'l4', xray: 1, label: [0, 18.8, -3.5], viewDir: [0, .6, -1], desc: '一大一小两张王座：洛里安与洛斯里克。弟弟体弱，哥哥背负着他——这是全游戏最让人心碎的 Boss 战。' });
defPart('window-great',{ name: '落地大窗', cat: 'l4', layer: 'l4', xray: 1, label: [-6.2, 18.5, -1], viewDir: [-1, .6, -.3], desc: '挑高的尖拱大窗，洛斯里克灰蓝色的天光从这里洒进来，照在王座上。' });
defPart('carpet',    { name: '红毯', cat: 'l4', layer: 'l4', xray: 1, noLabel: 1, desc: '从门口一直铺到王座前的红毯。踩上去，就没有回头路了。' });
defPart('tapestry',  { name: '挂毯', cat: 'l4', layer: 'l4', xray: 1, noLabel: 1, desc: '墙上的挂毯绣着洛斯里克王室的纹章，如今只剩灰尘记得它。' });
defPart('sword-lorian',{ name: '洛里安大剑', cat: 'l4', layer: 'l4', xray: 1, label: [2.2, 17.5, -3.5], viewDir: [1, .6, -.6], desc: '洛里安的大剑，斜倚在王座旁。圣剑的光辉熄灭了，但分量还在。' });

/* ============ 尺寸与层组 ============ */
const T = 0.4;                       // 石墙厚
const L1Y = 0, L1H = 5;              // 一层 0~5
const L2Y = 5, L2H = 5;              // 二层 5~10
const L3Y = 10, L3H = 6;             // 三层 10~16
const L4Y = 16, L4H = 5;             // 顶层 16~21
const TOPY = 21;                     // 屋顶基线

const gGround = new THREE.Group(), gL1 = new THREE.Group(), gL2 = new THREE.Group(),
      gL3 = new THREE.Group(), gL4 = new THREE.Group(), gRoof = new THREE.Group();
scene.add(gGround, gL1, gL2, gL3, gL4, gRoof);
const cutWalls = {};                 // 剖面时隐藏的墙分组

/* ============ 共享材质 ============ */
const stoneM = extM(0xffffff, { map: stoneTex, rough: 0.95 });
const stoneFrameM = extM(0x8a867c, { map: stoneTex, rough: 0.95 });
const darkStoneM = M(0xffffff, { map: darkStoneTex, rough: 0.95 });
const woodM = M(0xffffff, { map: woodTex, rough: 0.85 });
const darkWoodM = M(0x2e2013, { rough: 0.85 });
const waxM = extM(0xffffff, { map: waxTex, rough: 0.6 });
const waxPureM = M(0xe9dfc6, { rough: 0.45, emissive: 0x5a4a30, ei: 0.25 });
const parapM = extM(0x8a867c, { map: stoneTex, rough: 0.95 });
const glassLitM = M(0xffb45e, { emissive: 0xff9a3e, ei: 0.85, rough: 0.4 });
const glassDarkM = M(0x141821, { rough: 0.3, metal: 0.2 });
const ironM = M(0x2b2b30, { rough: 0.55, metal: 0.6 });
const goldM = M(0xc9a24a, { rough: 0.35, metal: 0.7 });
const paperM = M(0xffffff, { map: paperTex, rough: 0.95 });
const layerGroup = { ground: gGround, l1: gL1, l2: gL2, l3: gL3, l4: gL4, roof: gRoof };
function LP(id) { return P(id, layerGroup[PARTS[id].layer]); }

/* 每层外墙（南/北/东/西分组，南+东供剖面隐藏），附带本层地板 */
function levelWalls(id, y0, h, x0, x1, z0, z1, withFloor) {
  const g = LP(id);
  const gs = new THREE.Group(), gn = new THREE.Group(), gw = new THREE.Group(), ge = new THREE.Group();
  g.add(gs, gn, gw, ge);
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  box(w, h, T, stoneM, cx, y0 + h / 2, z1 - T / 2, gs);
  box(w, h, T, stoneM, cx, y0 + h / 2, z0 + T / 2, gn);
  box(T, h, d, stoneM, x0 + T / 2, y0 + h / 2, cz, gw);
  box(T, h, d, stoneM, x1 - T / 2, y0 + h / 2, cz, ge);
  if (withFloor) box(w, 0.3, d, darkStoneM, cx, y0 + 0.15, cz, g);
  cutWalls[id + 's'] = gs; cutWalls[id + 'e'] = ge;
  return { g, gs, gn, gw, ge };
}

/* 尖拱窗 */
function pointedWin(w, h, x, y, z, ry, parent, lit = true) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; parent.add(grp);
  const gl = box(w, h, 0.08, lit ? glassLitM : glassDarkM, 0, 0, 0, grp); gl.castShadow = false;
  box(0.24, h + 0.24, 0.26, stoneFrameM, -w / 2 - 0.12, 0, 0.02, grp);
  box(0.24, h + 0.24, 0.26, stoneFrameM, w / 2 + 0.12, 0, 0.02, grp);
  box(w + 0.48, 0.24, 0.26, stoneFrameM, 0, -h / 2 - 0.12, 0.02, grp);
  const t1 = box(0.2, h * 0.42, 0.24, stoneFrameM, -w * 0.22, h / 2 + h * 0.13, 0.02, grp); t1.rotation.z = 0.55;
  const t2 = box(0.2, h * 0.42, 0.24, stoneFrameM, w * 0.22, h / 2 + h * 0.13, 0.02, grp); t2.rotation.z = -0.55;
  box(0.09, h, 0.1, stoneFrameM, 0, 0, 0.05, grp);
  box(w, 0.09, 0.1, stoneFrameM, 0, h * 0.12, 0.05, grp);
  return grp;
}
/* 扶壁 */
function buttress(x, z, y0, h, parent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const m = stoneFrameM;
  box(1.3, h * 0.5, 1.3, m, 0, y0 + h * 0.25, 0, g);
  box(0.95, h * 0.3, 0.95, m, 0, y0 + h * 0.65, 0, g);
  box(0.62, h * 0.2, 0.62, m, 0, y0 + h * 0.9, 0, g);
  cone(0.5, 0.9, m, 0, y0 + h + 0.45, 0, g, 4);
}
/* 女儿墙 */
function parapet(x1, z1, x2, z2, y, parent) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const n = Math.max(2, Math.round(len / 1.3));
  const horiz = Math.abs(x2 - x1) > Math.abs(z2 - z1);
  box(horiz ? len : 0.35, 0.9, horiz ? 0.35 : len, parapM, (x1 + x2) / 2, y + 0.45, (z1 + z2) / 2, parent);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    box(horiz ? 0.6 : 0.45, 0.5, horiz ? 0.45 : 0.6, parapM, x1 + (x2 - x1) * t, y + 1.12, z1 + (z2 - z1) * t, parent);
  }
}
/* 石像鬼 */
function gargoyle(x, y, z, ry, parent) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const m = M(0x5c5a55, { rough: 0.95 });
  box(0.5, 0.7, 0.9, m, 0, 0.35, 0, g);
  box(0.34, 0.34, 0.42, m, 0, 0.85, 0.36, g);
  cone(0.09, 0.32, m, -0.12, 1.12, 0.3, g);
  cone(0.09, 0.32, m, 0.12, 1.12, 0.3, g);
  const w1 = box(0.14, 0.95, 0.72, m, -0.36, 0.72, -0.26, g); w1.rotation.z = 0.5; w1.rotation.y = 0.4;
  const w2 = box(0.14, 0.95, 0.72, m, 0.36, 0.72, -0.26, g); w2.rotation.z = -0.5; w2.rotation.y = -0.4;
  box(0.16, 0.16, 0.75, m, 0, 0.22, -0.72, g);
  box(0.7, 0.25, 0.7, m, 0, -0.05, 0, g);
}
/* 石梯 */
function stairRun(w, n, rise, run, x, y0, z0, dirZ, parent, mat) {
  for (let i = 0; i < n; i++)
    box(w, rise * (i + 1), run, mat || darkStoneM, x, y0 + rise * (i + 1) / 2, z0 + dirZ * run * (i + 0.5), parent);
}


/* ============ 地面与庭院 ============ */
(function buildGround() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), M(0xffffff, { map: groundTex, rough: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.05; ground.receiveShadow = true;
  scene.add(ground);

  const cy = P('courtyard', gGround);
  box(17, 0.14, 8.5, darkStoneM, 0, 0.02, 11.2, cy);                    // 庭院铺地
  box(20, 0.5, 19, darkStoneM, 0, -0.3, 3.2, cy);                      // 建筑基座
  // 庭院边缘矮柱
  for (let i = 0; i < 5; i++) {
    box(0.5, 1.1, 0.5, stoneFrameM, -8 + i * 4, 0.55, 15.2, cy);
    sph(0.3, stoneFrameM, -8 + i * 4, 1.25, 15.2, cy);
  }

  // 入口石阶
  const st = P('gate-stairs', gGround);
  stairRun(7, 4, 0.16, 0.55, 0, 0.05, 7.6, 1, st);

  // 篝火台
  const bf = P('bonfire', gGround);
  torus(0.85, 0.22, darkStoneM, 5.5, 0.25, 10.5, bf, Math.PI / 2);
  cone(0.8, 0.5, M(0x8a857c, { rough: 1 }), 5.5, 0.3, 10.5, bf, 10);
  box(0.14, 1.5, 0.3, ironM, 5.5, 0.9, 10.5, bf);                       // 螺旋剑剑身
  box(0.5, 0.12, 0.14, ironM, 5.5, 1.35, 10.5, bf);
  const fl1 = cone(0.32, 0.9, M(0xff7a1e, { emissive: 0xff6a00, ei: 2.2, rough: 0.6 }), 5.5, 0.95, 10.5, bf, 8);
  const fl2 = cone(0.18, 0.55, M(0xffd97a, { emissive: 0xffc84a, ei: 2.6, rough: 0.6 }), 5.5, 1.0, 10.5, bf, 8);
  fl1.castShadow = fl2.castShadow = false;
  const fireLight = new THREE.PointLight(0xff8c2e, 60, 20, 2);
  fireLight.position.set(5.5, 1.6, 10.5); bf.add(fireLight);

  // 庭院雕像：骑士
  const su = P('statue', gGround);
  box(1.6, 1.0, 1.6, darkStoneM, 0, 0.55, 13.6, su);
  box(1.2, 0.3, 1.2, stoneFrameM, 0, 1.2, 13.6, su);
  const km = M(0x6a675e, { rough: 0.8, metal: 0.25 });
  box(0.62, 1.1, 0.4, km, 0, 1.9, 13.6, su);
  sph(0.22, km, 0, 2.6, 13.6, su);
  box(0.5, 0.16, 0.5, km, 0, 2.78, 13.6, su);
  const sw = box(0.12, 1.5, 0.2, ironM, 0.45, 1.8, 13.9, su); sw.rotation.x = 0.25;
  box(0.3, 0.9, 0.24, km, -0.42, 1.75, 13.6, su);
  box(0.3, 0.9, 0.24, km, 0.42, 1.75, 13.6, su);
})();

/* ============ 四层外墙（含剖面分组） ============ */
const W1 = levelWalls('wall-l1', L1Y, L1H, -9, 9, -7, 7, true);
const W2 = levelWalls('wall-l2', L2Y, L2H, -9, 9, -7, 7, true);
const W3 = levelWalls('wall-l3', L3Y, L3H, -9, 9, -7, 7, true);
const W4 = levelWalls('wall-l4', L4Y, L4H, -6, 6, -5, 3, true);
box(12.8, 0.35, 8.8, darkStoneM, 0, TOPY + 0.17, -1, W4.g);   // 顶层屋顶板

(function buildExterior() {
  // 扶壁：四角 + 墙中
  const bt = P('buttress', gL2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) buttress(sx * 9.4, sz * 7.4, 0, 15.5, bt);
  for (const sx of [-4.5, 0, 4.5]) { buttress(sx, 7.4, 0, 15.5, bt); buttress(sx, -7.4, 0, 15.5, bt); }
  for (const sz of [-3.5, 3.5]) { buttress(9.4, sz, 0, 15.5, bt); buttress(-9.4, sz, 0, 15.5, bt); }

  // 蜡滴：底层外墙
  const wx = P('waxwall', gL1);
  const dripSpots = [[-5, 3.4, 7.22], [-1.5, 2.6, 7.22], [3.5, 3.8, 7.22], [6.5, 2.2, 7.22],
                     [-7, 3.0, -7.22], [2, 3.6, -7.22], [9.22, 2.8, 3], [9.22, 3.4, -2.5], [-9.22, 3.2, 0.5]];
  for (const [x, y, z] of dripSpots) {
    sph(0.4, waxM, x, y, z, wx, 1, 1.5, 0.45);
    box(0.2, 1.4, 0.1, waxM, x + 0.12, y - 0.9, z, wx);
    sph(0.55, waxM, x - 0.2, y - 1.7, z, wx, 1.2, 0.7, 0.4);
  }

  // 尖拱窗：L1小 / L2中 / L3高 / L4大
  for (const x of [-6, -3, 3, 6]) pointedWin(1.1, 1.6, x, 2.6, 7.02, 0, W1.gs, false);
  for (const x of [-6, -3, 3, 6]) pointedWin(1.1, 1.6, x, 2.6, -7.02, Math.PI, W1.gn, false);
  pointedWin(1.0, 1.5, -9.02, 2.6, 2, -Math.PI / 2, W1.gw, false);
  pointedWin(1.0, 1.5, 9.02, 2.6, -2, Math.PI / 2, W1.ge, false);
  for (const x of [-6.5, -3.5, 3.5, 6.5]) pointedWin(1.2, 2.0, x, 7.4, 7.02, 0, W2.gs, true);
  for (const x of [-6.5, -3.5, 3.5, 6.5]) pointedWin(1.2, 2.0, x, 7.4, -7.02, Math.PI, W2.gn, true);
  pointedWin(1.1, 1.9, -9.02, 7.4, 0, -Math.PI / 2, W2.gw, true);
  pointedWin(1.1, 1.9, 9.02, 7.4, 0, Math.PI / 2, W2.ge, true);
  for (const x of [-7, -4, 0, 4, 7]) pointedWin(1.4, 2.8, x, 13.2, 7.02, 0, W3.gs, true);
  for (const x of [-7, -4, 0, 4, 7]) pointedWin(1.4, 2.8, x, 13.2, -7.02, Math.PI, W3.gn, true);
  for (const z of [-4, 0, 4]) pointedWin(1.3, 2.6, -9.02, 13.2, z, -Math.PI / 2, W3.gw, true);
  for (const z of [-4, 0, 4]) pointedWin(1.3, 2.6, 9.02, 13.2, z, Math.PI / 2, W3.ge, true);
})();

/* ============ 屋顶露台与尖塔 ============ */
(function buildRoof() {
  // 东露台 (x 9..13)
  const te = P('terrace-e', gL3);
  box(4.4, 0.35, 14.4, darkStoneM, 11, 16.15, 0, te);
  parapet(9, -7, 9, 7, 16.3, te); parapet(13, -7, 13, 7, 16.3, te);
  parapet(9, -7, 13, -7, 16.3, te); parapet(9, 7, 13, 7, 16.3, te);
  // 西露台
  const tw = P('terrace-w', gL3);
  box(4.4, 0.35, 14.4, darkStoneM, -11, 16.15, 0, tw);
  parapet(-9, -7, -9, 7, 16.3, tw); parapet(-13, -7, -13, 7, 16.3, tw);
  parapet(-9, -7, -13, -7, 16.3, tw); parapet(-9, 7, -13, 7, 16.3, tw);
  // L4 周边露台女儿墙（L3 屋顶边缘）
  parapet(-9, -7, 9, -7, 16.3, te); parapet(-9, 7, 9, 7, 16.3, te);

  // 石像鬼 ×4
  const gg = P('gargoyle', gL3);
  gargoyle(12.9, 17.3, -5, Math.PI / 2, gg);
  gargoyle(12.9, 17.3, 5, Math.PI / 2, gg);
  gargoyle(-12.9, 17.3, -5, -Math.PI / 2, gg);
  gargoyle(-12.9, 17.3, 5, -Math.PI / 2, gg);

  // 尖塔
  const sp = P('spire', gRoof);
  box(7, 1.2, 7, stoneFrameM, 0, 21.6, -1, sp);
  cyl(0.2, 3.4, 7.5, M(0x3f3d38, { rough: 0.85 }), 0, 25.5, -1, sp, 8);
  sph(0.45, goldM, 0, 29.6, -1, sp);
  cone(0.25, 0.9, goldM, 0, 30.2, -1, sp, 8);
  // 塔身小尖拱窗
  pointedWin(0.9, 1.6, 0, 23.5, 2.55, 0, sp, true);

  // 猎人戒指小塔（西露台）
  const tl = P('tower-ladder', gRoof);
  cyl(1.6, 1.8, 5.5, stoneM, -11, 19, -3, tl, 10);
  cyl(1.9, 1.9, 0.4, stoneFrameM, -11, 21.9, -3, tl, 10);
  cone(0.2, 2.2, stoneFrameM, -11, 23, -3, tl, 8);
  for (let i = 0; i < 9; i++)  // 木梯
    box(0.7, 0.08, 0.12, woodM, -11, 16.6 + i * 0.55, -1.15 + i * 0.02, tl);
  box(0.08, 5.2, 0.1, woodM, -11.36, 19, -1.15, tl);
  box(0.08, 5.2, 0.1, woodM, -10.64, 19, -1.15, tl);
  const ring = torus(0.16, 0.05, goldM, -11, 22.3, -3, tl, Math.PI / 2); // 猎人戒指
  ring.castShadow = false;

  // 横梁牢笼区（东露台破洞）
  const bc = P('beams-cage', gRoof);
  box(3.2, 0.3, 3.2, darkStoneM, 11, 16.2, 5, bc);   // 破洞边缘
  const hole = box(1.8, 0.34, 1.8, M(0x0a0908), 11, 16.2, 5, bc); hole.castShadow = false;
  for (let i = 0; i < 4; i++)
    box(3.0, 0.18, 0.24, darkWoodM, 11, 15.2 - i * 0.55, 4 + i * 0.35, bc);  // 横梁
  const cageM = ironM;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    box(0.07, 1.4, 0.07, cageM, 11 + Math.cos(a) * 0.55, 13.6, 4.6 + Math.sin(a) * 0.55, bc);
  }
  torus(0.55, 0.06, cageM, 11, 14.35, 4.6, bc, 0);
  torus(0.55, 0.06, cageM, 11, 12.95, 4.6, bc, 0);
  cyl(0.03, 0.03, 2.2, cageM, 11, 15.6, 4.6, bc);   // 悬挂铁链
})();

/* ============ L1 入口大厅 ============ */
(function buildL1() {
  // 双开大门（半开）
  const gd = P('gate-double', gL1);
  box(3.6, 4.4, 0.5, stoneFrameM, 0, 2.5, 7.0, gd);
  const doorM = M(0xffffff, { map: woodTex, rough: 0.8 });
  const d1 = box(1.6, 4.0, 0.18, doorM, -0.85, 2.3, 7.0, gd); d1.rotation.y = 0.35;
  const d2 = box(1.6, 4.0, 0.18, doorM, 0.85, 2.3, 7.0, gd); d2.rotation.y = -0.12;
  for (const yy of [1.4, 2.4, 3.4]) {
    box(3.2, 0.14, 0.06, ironM, 0, yy, 7.12, gd);
  }
  box(0.12, 0.3, 0.12, goldM, -0.15, 2.3, 7.15, gd);

  // 大厅：石柱/挂毯/烛台/纸页
  const he = P('hall-entry', gL1);
  for (const sx of [-4, 4]) for (const sz of [-3, 3]) {
    box(0.9, 4.7, 0.9, stoneFrameM, sx, 2.65, sz, he);
    box(1.3, 0.3, 1.3, stoneFrameM, sx, 0.45, sz, he);
    box(1.3, 0.3, 1.3, stoneFrameM, sx, 4.85, sz, he);
  }
  const banM = M(0x5a1e2a, { rough: 0.95 });
  for (const x of [-6.5, -2.5, 2.5, 6.5]) {
    box(1.4, 3.0, 0.08, banM, x, 2.8, -6.75, he);
    box(1.4, 0.3, 0.1, goldM, x, 4.35, -6.75, he);
  }
  for (const [x, z] of [[-6, 5], [6, 5], [-6, -5], [6, -5]]) {   // 烛台
    cyl(0.06, 0.12, 1.6, ironM, x, 1.1, z, he);
    torus(0.35, 0.05, ironM, x, 1.95, z, he, Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      cyl(0.05, 0.05, 0.3, waxPureM, x + Math.cos(a) * 0.35, 2.05, z + Math.sin(a) * 0.35, he, 6).castShadow = false;
      sph(0.05, M(0xffb45e, { emissive: 0xff9a3e, ei: 2.5 }), x + Math.cos(a) * 0.35, 2.25, z + Math.sin(a) * 0.35, he, 1, 1.4, 1).castShadow = false;
    }
  }
  for (let i = 0; i < 14; i++)   // 散落书页
    box(0.4, 0.015, 0.55, paperM, -8 + rnd() * 16, 0.33, -6 + rnd() * 12, he, rnd() * 3).castShadow = false;

  // 一层石梯（北端上二层）
  const s1 = P('stair-l1', gL1);
  stairRun(4, 15, 0.31, 0.32, 0, 0.3, -1.8, -1, s1);
  box(0.15, 1.0, 5.2, stoneFrameM, -2.15, 2.6, -4.2, s1);
  box(0.15, 1.0, 5.2, stoneFrameM, 2.15, 2.6, -4.2, s1);
})();

/* ============ L2 蜡池厅 ============ */
(function buildL2() {
  const FY = 5.3;
  // 蜡池
  const wp = P('waxpool', gL2);
  cyl(2.3, 2.5, 1.0, stoneFrameM, 5.5, FY + 0.5, -2, wp, 18);
  const waxTop = cyl(2.0, 2.0, 0.18, waxPureM, 5.5, FY + 0.95, -2, wp, 18);
  waxTop.castShadow = false;
  for (let i = 0; i < 8; i++) {   // 凝固蜡块
    const a = rnd() * Math.PI * 2, r = 0.6 + rnd() * 1.1;
    sph(0.22 + rnd() * 0.2, waxPureM, 5.5 + Math.cos(a) * r, FY + 1.05, -2 + Math.sin(a) * r, wp, 1, 0.6, 1);
  }
  // 浸蜡学者剪影（俯身）
  const sm = M(0xe4d9c0, { rough: 0.7 });
  const scholar = new THREE.Group(); scholar.position.set(5.5, FY, -0.2); scholar.rotation.x = 0.5; wp.add(scholar);
  cone(0.42, 1.3, sm, 0, 0.65, 0, scholar, 10);
  sph(0.2, sm, 0, 1.4, 0.1, scholar);
  const waxLight = new THREE.PointLight(0xffc46a, 40, 13, 2);
  waxLight.position.set(5.5, FY + 2.2, -2); wp.add(waxLight);
  // 小蜡烛一圈
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    cyl(0.06, 0.06, 0.35, waxPureM, 5.5 + Math.cos(a) * 2.7, FY + 0.35, -2 + Math.sin(a) * 2.7, wp, 6).castShadow = false;
    sph(0.05, M(0xffb45e, { emissive: 0xff9a3e, ei: 2.5 }), 5.5 + Math.cos(a) * 2.7, FY + 0.6, -2 + Math.sin(a) * 2.7, wp, 1, 1.4, 1).castShadow = false;
  }

  // 祭坛（北端）
  const al = P('altar', gL2);
  box(6, 0.5, 3, darkStoneM, 0, FY + 0.25, -5.2, al);
  box(2.4, 1.1, 1.0, stoneFrameM, 0, FY + 1.05, -5.4, al);
  box(2.8, 0.18, 1.3, darkStoneM, 0, FY + 1.68, -5.4, al);
  for (const x of [-1, -0.5, 0, 0.5, 1]) {
    cyl(0.07, 0.07, 0.5 + (x === 0 ? 0.25 : 0), waxPureM, x, FY + 2.0, -5.4, al, 6).castShadow = false;
    sph(0.055, M(0xffb45e, { emissive: 0xff9a3e, ei: 2.5 }), x, FY + 2.32, -5.4, al, 1, 1.4, 1).castShadow = false;
  }
  const banM = M(0x5a1e2a, { rough: 0.95 });
  box(1.6, 3.2, 0.1, banM, -3.2, FY + 2.2, -6.75, al);
  box(1.6, 3.2, 0.1, banM, 3.2, FY + 2.2, -6.75, al);

  // 蜡覆祭司 ×3
  const pr = P('priest-wax', gL2);
  function priest(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, FY, z); g.rotation.y = ry; pr.add(g);
    const wm = M(0xded2b8, { map: waxTex, rough: 0.65 });
    cone(0.5, 1.7, wm, 0, 0.85, 0, g, 10);
    sph(0.22, wm, 0, 1.8, 0, g);
    box(0.5, 0.18, 0.5, wm, 0, 1.62, 0, g);   // 蜡帽檐
    const st = cyl(0.04, 0.04, 1.9, darkWoodM, 0.4, 0.95, 0.1, g, 6); st.rotation.z = 0.12;
    sph(0.3, waxPureM, -0.3, 0.25, 0.25, g, 1, 0.6, 1);   // 身上蜡块
  }
  priest(-4.5, -1, 0.6); priest(-2.8, 1.8, -0.4); priest(-5.6, 3.2, 1.2);

  // 书架机关拉杆（西墙）
  const lv = P('lever-shelf', gL2);
  const shelfM = M(0xffffff, { map: woodTex, rough: 0.85 });
  box(0.7, 3.4, 2.6, shelfM, -8.4, FY + 1.7, 2, lv);       // 滑开的书架（露出密室）
  box(0.5, 2.6, 1.8, M(0x0a0908), -8.55, FY + 1.3, 2, lv);  // 密室黑口
  const ch = box(0.9, 0.7, 0.7, darkWoodM, -8.3, FY + 0.35, 2, lv); ch.rotation.y = 0.3;  // 宝箱
  box(0.95, 0.12, 0.75, goldM, -8.3, FY + 0.72, 2, lv);
  box(0.12, 1.1, 0.12, ironM, -7.6, FY + 0.85, 3.6, lv);    // 拉杆
  const lvh = sph(0.12, woodM, -7.6, FY + 1.45, 3.6, lv); lvh.scale.set(1, 1.3, 1);
  box(0.5, 0.35, 0.1, M(0xcbb98f, { emissive: 0x6a5a30, ei: 0.4 }), -8.45, FY + 2.6, 3.35, lv); // 提示牌

  // 二层石梯（东北上三层）
  const s2 = P('stair-l2', gL2);
  stairRun(3.2, 15, 0.31, 0.32, 6.5, FY, -1.5, -1, s2);

  // 快捷升降机（东侧井道 L1<->L3）
  const lf = P('lift', gL2);
  wallSeg(6.8, 2.8, 6.8, 6.2, 0, 16, 0.3, darkStoneM, lf);
  wallSeg(8.8, 2.8, 8.8, 6.2, 0, 16, 0.3, darkStoneM, lf);
  wallSeg(6.8, 6.2, 8.8, 6.2, 0, 16, 0.3, darkStoneM, lf);
  box(1.9, 0.25, 3.0, woodM, 7.8, FY + 0.4, 4.5, lf);       // 平台
  for (const sx of [7.1, 8.5]) for (const sz of [3.2, 5.8])
    cyl(0.035, 0.035, 10.5, ironM, sx, FY + 5.5, sz, lf, 6);
  box(0.5, 1.2, 0.5, darkStoneM, 7.8, FY + 1.0, 6.35, lf);   // 拉闸
  const lvr = box(0.08, 0.9, 0.08, ironM, 7.8, FY + 1.9, 6.35, lf); lvr.rotation.x = 0.5;
})();

/* ============ L3 藏书长廊 ============ */
const bookCols = [0x8a2f2a, 0x2a4a7a, 0x2a6a4a, 0xb08a3a, 0x5a3a6a, 0xa06a2a, 0x3a7a8a, 0x777755, 0x943232, 0x2a5a5a];
const shelfWoodM = M(0x4a2f1a, { map: woodTex, rough: 0.85 });
function bookRow(w, y, z, parent, x) {
  let bx = x - w / 2;
  const end = x + w / 2;
  while (bx < end - 0.06) {
    const bw = 0.06 + rnd() * 0.07, bh = 0.3 + rnd() * 0.24;
    if (rnd() < 0.09) { bx += 0.16; continue; }
    const b = box(bw, bh, 0.3, M(bookCols[(rnd() * bookCols.length) | 0], { rough: 0.85 }), bx + bw / 2, y + bh / 2, z, parent);
    if (rnd() < 0.12) b.rotation.z = 0.16;
    bx += bw + 0.012;
  }
}
function bookshelf(w, h, x, y, z, ry, parent) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  box(0.14, h, 0.6, shelfWoodM, -w / 2, h / 2, 0, g);
  box(0.14, h, 0.6, shelfWoodM, w / 2, h / 2, 0, g);
  box(w + 0.14, 0.16, 0.6, shelfWoodM, 0, h - 0.08, 0, g);
  box(w + 0.14, 0.16, 0.6, shelfWoodM, 0, 0.08, 0, g);
  box(w, h, 0.1, shelfWoodM, 0, h / 2, -0.28, g);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const sy = 0.16 + (h - 0.32) / n * i;
    box(w, 0.08, 0.55, shelfWoodM, 0, sy, 0, g);
    bookRow(w - 0.24, sy + 0.04, 0.03, g, 0);
  }
  return g;
}
function spiralStair(cx, cz, r, y0, y1, parent) {
  const n = 30, totalA = Math.PI * 2 * 1.8;
  cyl(0.4, 0.5, y1 - y0, stoneFrameM, cx, (y0 + y1) / 2, cz, parent, 10);
  for (let i = 0; i < n; i++) {
    const a = i / n * totalA;
    const y = y0 + (y1 - y0) * i / (n - 1);
    const step = box(1.6, 0.22, 0.75, darkStoneM, cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, parent);
    step.rotation.y = -a;
    if (i % 3 === 0) box(0.09, 1.05, 0.09, ironM, cx + Math.cos(a) * (r + 0.75), y + 0.6, cz + Math.sin(a) * (r + 0.75), parent);
  }
  for (let i = 0; i < n - 2; i += 2) {
    const a0 = i / n * totalA, a1 = (i + 2) / n * totalA;
    const ys0 = y0 + (y1 - y0) * i / (n - 1) + 1.1, ys1 = y0 + (y1 - y0) * (i + 2) / (n - 1) + 1.1;
    const x0 = cx + Math.cos(a0) * (r + 0.75), z0 = cz + Math.sin(a0) * (r + 0.75);
    const x1 = cx + Math.cos(a1) * (r + 0.75), z1 = cz + Math.sin(a1) * (r + 0.75);
    const len = Math.hypot(x1 - x0, z1 - z0, ys1 - ys0);
    const rail = box(0.09, 0.09, len, ironM, (x0 + x1) / 2, (ys0 + ys1) / 2, (z0 + z1) / 2, parent);
    rail.lookAt(x1, ys1, z1);
  }
}
function curseHandCluster(x, y, z, ry, parent, n = 4) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const m = M(0x0d0a18, { rough: 0.55, emissive: 0x3a2060, ei: 0.7, transparent: true, opacity: 0.94 });
  for (let i = 0; i < n; i++) {
    const px = (i - (n - 1) / 2) * 0.55 + (rnd() - 0.5) * 0.2;
    const len = 1.0 + rnd() * 0.8;
    const arm = cone(0.17, len, m, px, len / 2, 0, g, 7);
    arm.rotation.x = -0.45 - rnd() * 0.35;
    for (let f = 0; f < 3; f++) {
      const fg = cone(0.05, 0.42, m, px + (f - 1) * 0.13, len * 0.82, 0.3, g, 5);
      fg.rotation.x = -0.95;
    }
  }
}
function chandelier(x, y, z, parent) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  cyl(0.045, 0.045, 2.4, ironM, 0, 1.5, 0, g, 6);
  torus(1.15, 0.08, ironM, 0, 0, 0, g, Math.PI / 2);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const cx = Math.cos(a) * 1.15, cz = Math.sin(a) * 1.15;
    cyl(0.055, 0.055, 0.32, waxPureM, cx, 0.2, cz, g, 6).castShadow = false;
    sph(0.055, M(0xffb45e, { emissive: 0xff9a3e, ei: 2.8 }), cx, 0.42, cz, g, 1, 1.5, 1).castShadow = false;
  }
}

(function buildL3() {
  const FY = 10.3;
  const gal = P('gallery', gL3);
  for (let i = 0; i < 16; i++)
    box(0.4, 0.015, 0.55, paperM, -8 + rnd() * 16, FY + 0.03, -6 + rnd() * 12, gal, rnd() * 3).castShadow = false;
  // 中央大吊灯链条座
  box(2.2, 0.4, 2.2, stoneFrameM, 0, 15.9, 0, gal);

  // 高大书架群
  const sh = P('shelves', gL3);
  for (const z of [-4, 0, 4]) {
    bookshelf(3.2, 4.6, -8.2, FY, z, Math.PI / 2, sh);
    bookshelf(3.2, 4.6, 8.2, FY, z, -Math.PI / 2, sh);
  }
  bookshelf(3.2, 4.6, -2, FY, -6.2, 0, sh);
  bookshelf(3.2, 4.6, 2, FY, -6.2, 0, sh);

  // 滑动书架（北墙，露出密室）
  const ss = P('shelf-slide', gL3);
  const moved = bookshelf(2.6, 4.2, 5.8, FY, -6.2, 0, ss);
  moved.position.x = 7.6;
  box(1.8, 3.0, 0.6, M(0x0a0908), 5.6, FY + 1.5, -6.5, ss);
  const ch2 = box(0.9, 0.7, 0.7, darkWoodM, 5.6, FY + 0.35, -6.2, ss); ch2.rotation.y = -0.25;
  box(0.95, 0.12, 0.75, goldM, 5.6, FY + 0.72, -6.2, ss);
  box(0.12, 1.1, 0.12, ironM, 3.4, FY + 0.85, -5.9, ss);
  sph(0.12, shelfWoodM, 3.4, FY + 1.45, -5.9, ss);

  // 诅咒之手 ×3 处
  const chd = P('curse-hands', gL3);
  curseHandCluster(-7.7, 11.2, 1.8, Math.PI / 2, chd, 5);
  curseHandCluster(-2, 11.8, -6.5, 0, chd, 4);
  curseHandCluster(7.7, 12.2, -2.6, -Math.PI / 2, chd, 4);

  // 回廊阳台
  const bc = P('balcony', gL3);
  for (const sx of [-1, 1]) {
    box(2.0, 0.25, 12.4, darkStoneM, sx * 7.8, 13.42, 0, bc);
    for (let i = 0; i <= 6; i++) box(0.09, 1.0, 0.09, ironM, sx * 6.85, 14.05, -6 + i * 2, bc);
    box(0.1, 0.09, 12.4, ironM, sx * 6.85, 14.58, 0, bc);
    for (const z of [-5, 0, 5]) box(0.35, 3.0, 0.35, stoneFrameM, sx * 7.8, 11.9, z, bc);
  }

  // 吊灯 ×2
  const cd = P('chandelier', gL3);
  chandelier(0, 14.2, -3, cd);
  chandelier(0, 14.2, 3, cd);
  const chLight = new THREE.PointLight(0xffb060, 55, 17, 2);
  chLight.position.set(0, 14.2, 0); cd.add(chLight);

  // 学者书桌 ×2
  const dk = P('desk-scholar', gL3);
  function desk(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, FY, z); g.rotation.y = ry; dk.add(g);
    box(1.8, 0.1, 0.9, shelfWoodM, 0, 0.78, 0, g);
    for (const sx of [-0.8, 0.8]) for (const sz of [-0.35, 0.35]) box(0.09, 0.78, 0.09, shelfWoodM, sx, 0.39, sz, g);
    for (let i = 0; i < 3; i++) box(0.5 - i * 0.07, 0.12, 0.36, paperM, -0.5, 0.89 + i * 0.12, 0.1, g);
    box(0.4, 0.3, 0.3, M(bookCols[(rnd() * 10) | 0], { rough: 0.85 }), 0.45, 0.98, -0.15, g);
    cyl(0.04, 0.04, 0.3, waxPureM, 0.6, 0.98, 0.25, g, 6).castShadow = false;
    sph(0.045, M(0xffb45e, { emissive: 0xff9a3e, ei: 2.5 }), 0.6, 1.16, 0.25, g, 1, 1.4, 1).castShadow = false;
    const q = cyl(0.015, 0.015, 0.5, paperM, -0.1, 1.0, 0.3, g, 5); q.rotation.z = 1.1; q.castShadow = false;
    box(0.5, 0.45, 0.5, darkWoodM, 0, 0.22, 0.85, g);   // 凳
  }
  desk(4, 4.5, 0.3); desk(-5.5, 4.5, -0.4);

  // 旋转楼梯
  const sp2 = P('stair-spiral', gL3);
  spiralStair(-3.5, -1, 1.7, FY, 16.3, sp2);
})();

/* ============ L4 双王子王座厅 ============ */
function throne(w, h, x, y, z, ry, parent) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const m = M(0xffffff, { map: woodTex, rough: 0.7 });
  box(w, 0.5, 0.85, m, 0, 0.25, 0, g);
  box(w, h, 0.35, m, 0, h / 2 + 0.45, -0.38, g);
  const t1 = box(0.18, 0.95, 0.3, m, -w / 2 + 0.2, h + 0.65, -0.38, g); t1.rotation.z = 0.4;
  const t2 = box(0.18, 0.95, 0.3, m, w / 2 - 0.2, h + 0.65, -0.38, g); t2.rotation.z = -0.4;
  box(0.32, h * 0.5, 0.95, m, -w / 2 - 0.06, h * 0.32 + 0.45, 0, g);
  box(0.32, h * 0.5, 0.95, m, w / 2 + 0.06, h * 0.32 + 0.45, 0, g);
  cone(0.15, 0.55, goldM, -w / 2 + 0.2, h + 1.25, -0.38, g, 4);
  cone(0.15, 0.55, goldM, w / 2 - 0.2, h + 1.25, -0.38, g, 4);
  box(w - 0.3, 0.18, 0.72, M(0x5a1e2a, { rough: 0.95 }), 0, 0.6, 0.05, g);
  return g;
}

(function buildL4() {
  const FY = 16.3;
  // 王座长廊：南双开门 + 门框
  const co = P('corridor', gL4);
  box(3.0, 3.6, 0.5, stoneFrameM, 0, FY + 1.8, 3.0, co);
  const doorM = M(0xffffff, { map: woodTex, rough: 0.8 });
  const d1 = box(1.35, 3.3, 0.16, doorM, -0.72, FY + 1.65, 3.0, co); d1.rotation.y = 0.5;
  box(1.35, 3.3, 0.16, doorM, 0.72, FY + 1.65, 3.0, co);
  for (const x of [-4, 4]) {
    box(0.7, 3.6, 0.7, stoneFrameM, x, FY + 1.8, 1.5, co);
    sph(0.3, M(0xffb45e, { emissive: 0xff9a3e, ei: 1.8 }), x, FY + 3.0, 1.1, co, 1, 1.3, 1).castShadow = false;
  }

  // 王座：北端高台，一大一小
  const th = P('throne', gL4);
  box(7, 0.5, 2.6, darkStoneM, 0, FY + 0.25, -3.6, th);
  box(7, 0.25, 2.6, darkStoneM, 0, FY + 0.62, -3.6, th);
  throne(2.0, 2.2, -1.3, FY + 0.75, -3.8, 0, th);    // 洛里安大王座
  throne(1.3, 1.5, 1.4, FY + 0.75, -3.7, 0, th);     // 洛斯里克小王座
  // 王座上的剪影（示意）
  const figM = M(0x3a3f4a, { rough: 0.6, metal: 0.4 });
  box(0.7, 0.9, 0.5, figM, -1.3, FY + 1.6, -3.7, th);
  sph(0.24, figM, -1.3, FY + 2.25, -3.65, th);
  box(0.45, 0.6, 0.35, figM, 1.4, FY + 1.35, -3.6, th);
  sph(0.18, figM, 1.4, FY + 1.8, -3.55, th);

  // 落地大窗（东西墙各三扇）
  const wg = P('window-great', gL4);
  for (const z of [-2.5, 0, 2.5]) {
    pointedWin(1.5, 3.4, -6.02, FY + 2.4, z, -Math.PI / 2, wg, true);
    pointedWin(1.5, 3.4, 6.02, FY + 2.4, z, Math.PI / 2, wg, true);
  }
  pointedWin(1.6, 3.6, 0, FY + 2.5, -5.02, Math.PI, wg, true);   // 北墙中央大窗

  // 红毯
  const cp = P('carpet', gL4);
  const r = box(2.2, 0.04, 6.5, M(0xffffff, { map: carpetTex, rough: 0.98 }), 0, FY + 0.33, -0.5, cp);
  r.receiveShadow = true;

  // 挂毯
  const tp = P('tapestry', gL4);
  const tapM = M(0x4a2a3a, { rough: 0.95 });
  for (const x of [-4, 4]) {
    box(1.5, 3.4, 0.1, tapM, x, FY + 2.6, -4.75, tp);
    box(1.5, 0.25, 0.12, goldM, x, FY + 4.35, -4.75, tp);
  }
  box(1.5, 3.4, 0.1, tapM, -5.75, FY + 2.6, 0, tp);

  // 洛里安大剑
  const sw = P('sword-lorian', gL4);
  const g = new THREE.Group(); g.position.set(2.6, FY + 0.75, -3.0); g.rotation.z = -0.35; g.rotation.y = 0.3; sw.add(g);
  box(0.28, 2.6, 0.08, M(0x9aa2b0, { rough: 0.35, metal: 0.75 }), 0, 1.5, 0, g);
  box(0.9, 0.16, 0.14, goldM, 0, 0.25, 0, g);
  cyl(0.07, 0.07, 0.5, darkWoodM, 0, -0.05, 0, g, 8);
  sph(0.11, goldM, 0, -0.35, 0, g);
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

const partsWrap = document.getElementById('parts');
for (const ck of ['out', 'yard', 'l1', 'l2', 'l3', 'l4', 'roof']) {
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

function setMode(m) {
  cur = m;
  document.querySelectorAll('.vbtn').forEach(b => b.classList.toggle('on', b.dataset.view === m));
  gRoof.visible = (m !== 'interior');
  const cut = (m === 'interior');
  for (const k in cutWalls) cutWalls[k].visible = !cut;
  const xray = (m === 'xray');
  extMats.forEach(mt => { mt.transparent = xray; mt.opacity = xray ? 0.14 : 1; mt.depthWrite = !xray; mt.needsUpdate = true; });
  if (m === 'exterior') flyTo(V(34, 24, 40), V(0, 10, 0));
  if (m === 'interior') flyTo(V(25, 21, 31), V(0, 9.5, 0));
  if (m === 'roof') flyTo(V(23, 36, 27), V(0, 17, 0));
  if (m === 'xray') flyTo(V(34, 26, 38), V(0, 10, 0));
}
document.querySelectorAll('.vbtn').forEach(b => b.onclick = () => setMode(b.dataset.view));

const tLabels = document.getElementById('tLabels');
tLabels.onclick = () => { labelsOn = !labelsOn; tLabels.classList.toggle('on', labelsOn); };
const tRotate = document.getElementById('tRotate');
tRotate.onclick = () => { controls.autoRotate = !controls.autoRotate; tRotate.classList.toggle('on', controls.autoRotate); };
document.getElementById('explode').addEventListener('input', e => {
  const t = e.target.value / 100;
  gRoof.position.y = 9 * t;
  gL4.position.y = 6.5 * t;
  gL3.position.y = 4 * t;
  gL2.position.y = 2 * t;
});
document.getElementById('menuBtn').onclick = () => { panel.classList.toggle('hide'); setTimeout(onResize, 260); };
document.getElementById('infoX').onclick = () => infoEl.classList.remove('show');

function ensureVisible(p) {
  const L = p.layer;
  if (L === 'roof') { if (cur === 'interior' || cur === 'xray') setMode('exterior'); return; }
  if (L === 'ground') return;
  if (p.xray) {
    if (cur === 'exterior') setMode('xray');
    else if (cur === 'roof') setMode('xray');
  } else if (cur === 'interior') setMode('xray');
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
  infoCat.textContent = CATS[p.cat];
  infoDesc.textContent = p.desc;
  infoEl.classList.add('show');
  p.group.updateWorldMatrix(true, true);
  tmpBox.setFromObject(p.group);
  if (!tmpBox.isEmpty()) {
    const c = tmpBox.getCenter(new THREE.Vector3());
    const size = tmpBox.getSize(new THREE.Vector3()).length();
    const dir = V(...(p.viewDir || [1, 0.6, 1])).normalize();
    flyTo(c.clone().addScaledVector(dir, Math.max(3.2, size * 1.5)), c);
  }
  clearHl();
  hlBox = new THREE.Box3Helper(tmpBox, 0xffb020);
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
    const showXray = cur === 'xray' || cur === 'interior';
    if (!labelsOn || !isShown(p.group) || (p.xray && !showXray)) { el.style.display = 'none'; continue; }
    pv.copy(v).applyMatrix4(p.group.matrixWorld).project(camera);
    if (pv.z > 1 || pv.z < -1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((pv.x * 0.5 + 0.5) * viewW) + 'px';
    el.style.top = ((-pv.y * 0.5 + 0.5) * viewH) + 'px';
  }
}

function onResize() {
  viewW = view.clientWidth; viewH = view.clientHeight;
  if (viewW < 2 || viewH < 2) return;
  renderer.setSize(viewW, viewH);
  camera.aspect = viewW / viewH;
  camera.fov = viewW < viewH ? 62 : 48;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

function animate() {
  requestAnimationFrame(animate);
  if (fly) {
    camera.position.lerp(fly.pos, 0.07);
    controls.target.lerp(fly.tgt, 0.07);
    if (camera.position.distanceTo(fly.pos) < 0.08) fly = null;
  }
  controls.update();
  if (selected && hlBox && PARTS[selected].group) tmpBox.setFromObject(PARTS[selected].group);
  refreshLabels();
  renderer.render(scene, camera);
}

if (window.matchMedia('(max-width: 760px)').matches) panel.classList.add('hide');
onResize();
setMode('exterior');
animate();
document.getElementById('loading').style.display = 'none';
