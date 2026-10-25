<template>
  <!--
    Живой задник: стена из 3D-кубиков, которые медленно выдвигаются и задвигаются.
    За стеной как будто стоит синяя лампа, а кубики — её защитный слой:
    когда кубик выдвигается, свет прорывается из-под него мягким ореолом со всех сторон.
    Рисуется через Three.js (WebGL). Если WebGL недоступен — canvas прячется,
    и остаётся картинка bg.jpg, которую ставит родитель. Пусто не будет.

    Управление снаружи — проп active: true — стена живёт, false — замирает.
  -->
  <div ref="root" class="tile-wall">
    <canvas v-show="webgl" ref="canvas" class="tile-canvas"></canvas>

    <!-- Мелкие подписи, как на картинке-референсе. Обычный HTML поверх canvas. -->
    <!-- Без WebGL виден bg.jpg, а на нём уже есть свои подписи — наши не нужны. -->
    <div v-show="webgl" class="labels" aria-hidden="true">
      <div v-for="l in labels" :key="l.id" class="label" :style="l.style">
        <span v-for="(line, n) in l.lines" :key="n">{{ line }}</span>
        <i class="dash"></i>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Все настройки стены — в одном месте. Крути смело.
const CFG = {
  columns: 26,          // сколько плиток по ширине экрана (на 1920 плитка ≈ 74px)
  minTilePx: 46,        // на узких экранах плитка не мельче этого
  gap: 0.05,            // щель между плитками, в долях плитки
  bevel: 0.035,         // скругление граней — ловит свет, выглядит как настоящий кубик
  raiseMin: 0.12,       // насколько выдвигается кубик, в долях плитки
  raiseMax: 0.42,
  raisedShare: 0.13,    // какая доля кубиков выдвинута одновременно
  glowShare: 1,         // у какой доли выдвинутых прорывается свет (1 = у всех)
  hatchShare: 0.05,     // доля плиток со штриховкой
  moveMs: [1100, 2200], // сколько едет один кубик (случайно в этом диапазоне)
  everyMs: 180,         // как часто какой-то кубик начинает двигаться
  glowColor: "#2f6bff",
  glowPower: 1.3,       // яркость синего ореола
  haloSize: 1.7,        // ореол при полном выдвижении, в размерах плитки (1 = ровно плитка)
  pulse: 0.15,          // насколько ореол "дышит" (0 — ровный свет)
  tileColor: "#2a2e36", // цвет плитки (был #16181d — светлее)
  parallax: 0.5,        // насколько камера следует за мышью, в плитках

  // Свечение по зонам: в центре тусклее (не перебивает текст и телефон), по краям ярче.
  // Числа — множитель к glowPower. Разницу держим умеренной, чтобы не было резкого контраста.
  glowCenter: 0.35,     // множитель в центре экрана
  glowEdge: 1.15,       // множитель у краёв
  zoneStart: 0.15,      // до этого расстояния от центра (0 — центр, 1 — край экрана) — полностью "центр"
  zoneEnd: 1.05,        // отсюда и дальше — полностью "край"; между ними плавный переход
};

const LABELS = [
  { id: "a", lines: ["Visual", "education", "for a brighter", "tomorrow"], style: { top: "7%", right: "3%" } },
  { id: "b", lines: ["Artists", "ideas", "projects", "people"], style: { bottom: "9%", left: "5%" } },
  { id: "c", lines: ["3D", "motion", "design", "community"], style: { bottom: "10%", left: "52%" } },
];

const rand = (a, b) => a + Math.random() * (b - a);
const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
// Плавный переход 0 → 1, когда x идёт от a до b (без резкой границы на концах).
const smoothstep = (a, b, x) => {
  const p = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return p * p * (3 - 2 * p);
};

// Переиспользуемые объекты, чтобы не создавать новые 60 раз в секунду.
const DUMMY = new THREE.Object3D();
const TMP_COLOR = new THREE.Color();
const GLOW = new THREE.Color(CFG.glowColor);

// Текстура плитки рисуется прямо в коде: мелкое зерно (бетон, а не пластик)
// и, для части плиток, диагональная штриховка — как на референсе.
function makeTexture(hatch) {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d");
  const img = g.createImageData(s, s);
  for (let p = 0; p < img.data.length; p += 4) {
    const v = 190 + Math.random() * 65;
    img.data[p] = img.data[p + 1] = img.data[p + 2] = v;
    img.data[p + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  if (hatch) {
    g.strokeStyle = "rgba(0,0,0,0.45)";
    g.lineWidth = 3;
    for (let k = -s; k < 2 * s; k += 10) {
      g.beginPath();
      g.moveTo(k, 0);
      g.lineTo(k + s, s);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Текстура ореола: квадрат по центру (там, где кубик, — его всё равно не видно)
// и мягкий спад света от его краёв наружу. Скруглённые углы получаются сами.
function makeHaloTexture() {
  const s = 128;
  const inner = 0.56; // край кубика в долях текстуры (0.95 / 1.7)
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d");
  const img = g.createImageData(s, s);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const u = ((x + 0.5) / s) * 2 - 1;
      const v = ((y + 0.5) / s) * 2 - 1;
      const dx = Math.max(Math.abs(u) - inner, 0);
      const dy = Math.max(Math.abs(v) - inner, 0);
      const d = Math.sqrt(dx * dx + dy * dy) / (1 - inner); // 0 у края кубика → 1 у края текстуры
      const a = d >= 1 ? 0 : Math.pow(1 - d, 2.2);
      const p = (y * s + x) * 4;
      img.data[p] = img.data[p + 1] = img.data[p + 2] = 255 * a;
      img.data[p + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default {
  name: "TileWall",
  props: {
    // Слайд на экране — анимируем. Уехал — не рисуем вообще.
    active: { type: Boolean, default: false },
  },
  data() {
    return { webgl: true, labels: LABELS };
  },
  watch: {
    active(on) {
      if (on) this.start();
      else this.stop();
    },
  },
  mounted() {
    // Всё, что связано с Three.js, лежит в this._t, а НЕ в data().
    // data() Vue делает реактивным — оборачивает каждый объект в прокси.
    // Для сотен матриц и буферов это медленно и ломает Three.js.
    try {
      this.init();
    } catch (e) {
      console.warn("TileWall: WebGL недоступен, остаётся картинка", e);
      this.webgl = false;
      return;
    }
    this._reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();

    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(this.$refs.root);
    window.addEventListener("pointermove", this.onPointer, { passive: true });

    // Стена грузится отдельным файлом и может появиться, когда слайд уже на экране.
    if (this.active) this.start();
  },
  unmounted() {
    this.stop();
    if (this._ro) this._ro.disconnect();
    window.removeEventListener("pointermove", this.onPointer);
    this.dispose();
  },
  methods: {
    /* ---------- сцена ---------- */

    init() {
      const renderer = new THREE.WebGLRenderer({
        canvas: this.$refs.canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      // PCFSoftShadowMap в новых версиях Three.js убрали — PCFShadowMap с radius даёт мягкие тени.
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#040507");

      // Узкий угол обзора + камера далеко = почти "плоский" вид спереди,
      // как на картинке, но с лёгкой перспективой — видно боковины выдвинутых кубиков.
      const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 400);

      // Свет: слабая заливка + основной сверху-слева-спереди с тенями.
      scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x000000, 0.5));
      const key = new THREE.DirectionalLight(0xdfe6ff, 2.8);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
      key.shadow.radius = 4;
      scene.add(key, key.target);

      // Постобработка: bloom слегка размывает самое яркое — ореол становится ещё мягче.
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.8, 0.8);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());

      // Геометрия и материалы общие для всех плиток — создаются один раз.
      // Передняя грань кубика в z = 0, поэтому "выдвинуть" = просто сдвинуть по z.
      const tileGeo = new RoundedBoxGeometry(1 - CFG.gap, 1 - CFG.gap, 1, 2, CFG.bevel);
      tileGeo.translate(0, 0, -0.5);
      // Ореол — плоский квадрат 1×1. Размер задаём масштабом.
      const glowGeo = new THREE.PlaneGeometry(1, 1);

      const plainMat = new THREE.MeshStandardMaterial({ map: makeTexture(false), roughness: 0.8, metalness: 0.3 });
      const hatchMat = new THREE.MeshStandardMaterial({ map: makeTexture(true), roughness: 0.85, metalness: 0.25 });
      // Additive — свет не закрашивает плитку, а ДОБАВЛЯЕТСЯ к ней, как настоящий.
      // depthWrite: false — ореолы не перекрывают друг друга, а складываются.
      const glowMat = new THREE.MeshBasicMaterial({
        map: makeHaloTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this._t = {
        renderer, scene, camera, composer, key,
        tileGeo, glowGeo, plainMat, hatchMat, glowMat,
        tiles: [], meshes: [], glowMesh: null,
        moving: new Set(),   // номера кубиков, которые сейчас едут
        cols: 0, rows: 0, dist: 40, visW: 1, visH: 1,
        running: false, started: false, lastSpawn: 0,
        pointer: { x: 0, y: 0 }, cam: { x: 0, y: 0 },
      };
    },

    // Подгоняем камеру и сетку под размер экрана.
    resize() {
      const t = this._t;
      if (!t) return;
      const w = this.$refs.root.clientWidth;
      const h = this.$refs.root.clientHeight;
      if (!w || !h) return;

      t.renderer.setSize(w, h, false);
      t.composer.setSize(w, h);

      // Одна плитка = 1 единица в 3D. Камеру ставим на такое расстояние,
      // чтобы по ширине экрана влезало ровно CFG.columns плиток.
      const tilePx = Math.max(CFG.minTilePx, w / CFG.columns);
      const visW = w / tilePx;
      const visH = h / tilePx;
      t.camera.aspect = w / h;
      t.dist = visH / 2 / Math.tan(THREE.MathUtils.degToRad(t.camera.fov / 2));
      t.camera.updateProjectionMatrix();
      t.visW = visW;
      t.visH = visH;

      // +4 плитки запаса по краям — чтобы при параллаксе не было видно конца стены.
      const cols = Math.ceil(visW) + 4;
      const rows = Math.ceil(visH) + 4;
      if (cols !== t.cols || rows !== t.rows) {
        t.cols = cols;
        t.rows = rows;
        this.buildGrid(cols, rows);
        if (t.started) this.wave(performance.now());
      }
      // Окно поменялось — центр и края теперь в других плитках.
      this.applyZones();

      // Тень от выдвинутых кубиков падает вправо-вниз.
      const s = Math.max(cols, rows) * 0.75;
      Object.assign(t.key.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 200 });
      t.key.shadow.camera.updateProjectionMatrix();
      t.key.position.set(-visW * 0.5, visH * 0.7, 30);
      t.key.target.position.set(0, 0, 0);

      this.updateCamera(true);
      if (!t.running) this.draw(); // первый кадр сразу — шейдеры скомпилируются заранее
    },

    // Создаём плитки. InstancedMesh — один объект на сотни одинаковых кубиков:
    // видеокарта рисует их одной командой, а не сотнями.
    buildGrid(cols, rows) {
      const t = this._t;
      t.meshes.forEach((m) => { t.scene.remove(m); m.dispose(); });
      if (t.glowMesh) { t.scene.remove(t.glowMesh); t.glowMesh.dispose(); }
      t.moving.clear();

      const tiles = [];
      const counters = [0, 0]; // [обычные, со штриховкой]
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const type = Math.random() < CFG.hatchShare ? 1 : 0;
          tiles.push({
            x: c - (cols - 1) / 2,
            y: r - (rows - 1) / 2,
            type,
            slot: counters[type]++,          // номер внутри своего InstancedMesh
            raise: 0, from: 0, to: 0, t0: 0, dur: 1,
            glow: Math.random() < CFG.glowShare ? rand(0.5, 1) : 0, // сила лампы под этим кубиком
            phase: rand(0, Math.PI * 2),      // своя фаза "дыхания" ореола
            shade: rand(0.75, 1.25),          // плитки чуть разные по тону
            zone: 1,                          // множитель свечения по месту на экране (см. applyZones)
          });
        }
      }

      t.meshes = [
        new THREE.InstancedMesh(t.tileGeo, t.plainMat, counters[0]),
        new THREE.InstancedMesh(t.tileGeo, t.hatchMat, counters[1]),
      ];
      t.meshes.forEach((m) => {
        m.castShadow = true;
        m.receiveShadow = true;
        m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        t.scene.add(m);
      });
      t.glowMesh = new THREE.InstancedMesh(t.glowGeo, t.glowMat, tiles.length);
      t.glowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      t.scene.add(t.glowMesh);

      const base = new THREE.Color(CFG.tileColor);
      tiles.forEach((tile, i) => {
        t.meshes[tile.type].setColorAt(tile.slot, TMP_COLOR.copy(base).multiplyScalar(tile.shade));
        this.placeTile(tile, i);
      });
      t.tiles = tiles;
      this.flush();
    },

    // Записываем положение одного кубика и его ореола.
    placeTile(tile, i, now = 0) {
      const t = this._t;

      DUMMY.position.set(tile.x, tile.y, tile.raise);
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.scale.set(1, 1, 1);
      DUMMY.updateMatrix();
      t.meshes[tile.type].setMatrixAt(tile.slot, DUMMY.matrix);

      // Ореол висит на полпути между соседями (z = 0) и лицом кубика.
      // Середину закрывает сам кубик — видно только свет вокруг его краёв.
      // Чем сильнее выдвинут, тем шире ореол: свет "вырывается" по мере выхода.
      const e = Math.min(1, tile.raise / CFG.raiseMax);
      const size = e > 0.001 ? 0.95 + (CFG.haloSize - 0.95) * e : 0.0001;
      DUMMY.position.set(tile.x, tile.y, tile.raise * 0.5);
      DUMMY.scale.set(size, size, 1);
      DUMMY.updateMatrix();
      t.glowMesh.setMatrixAt(i, DUMMY.matrix);

      this.tintHalo(tile, i, now);
    },

    // Для каждой плитки: насколько она далеко от центра экрана → множитель свечения.
    // Расстояние меряем в долях половины экрана по X и по Y отдельно,
    // поэтому "центр" — не круг, а овал по форме экрана.
    applyZones() {
      const t = this._t;
      const hx = t.visW / 2;
      const hy = t.visH / 2;
      const now = performance.now();
      t.tiles.forEach((tile, i) => {
        const r = Math.hypot(tile.x / hx, tile.y / hy);
        const z = smoothstep(CFG.zoneStart, CFG.zoneEnd, r);
        tile.zone = CFG.glowCenter + (CFG.glowEdge - CFG.glowCenter) * z;
        this.tintHalo(tile, i, now);
      });
      this.flush();
    },

    // Яркость ореола: сила лампы × насколько выдвинут × место на экране × лёгкое "дыхание".
    tintHalo(tile, i, now) {
      const e = Math.min(1, tile.raise / CFG.raiseMax);
      const amp = this._reduced ? 0 : CFG.pulse;
      const pulse = 1 - amp + amp * Math.sin(now * 0.0025 + tile.phase);
      const k = tile.glow * CFG.glowPower * tile.zone * e * pulse;
      this._t.glowMesh.setColorAt(i, TMP_COLOR.copy(GLOW).multiplyScalar(k));
    },

    // Сообщаем видеокарте, что буферы изменились.
    flush() {
      const t = this._t;
      t.meshes.forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      });
      t.glowMesh.instanceMatrix.needsUpdate = true;
      if (t.glowMesh.instanceColor) t.glowMesh.instanceColor.needsUpdate = true;
    },

    /* ---------- движение кубиков ---------- */

    moveTile(i, to, t0) {
      const tile = this._t.tiles[i];
      tile.from = tile.raise;
      tile.to = to;
      tile.t0 = t0;
      tile.dur = this._reduced ? 1 : rand(CFG.moveMs[0], CFG.moveMs[1]);
      this._t.moving.add(i);
    },

    // Стартовая волна: при заходе на слайд стена "просыпается" —
    // нужная доля кубиков выезжает вразнобой в течение ~1.6 сек.
    wave(now) {
      const t = this._t;
      const target = Math.round(t.tiles.length * CFG.raisedShare);
      for (let n = 0; n < target; n++) {
        const i = Math.floor(Math.random() * t.tiles.length);
        if (t.tiles[i].to > 0) continue;
        this.moveTile(i, rand(CFG.raiseMin, CFG.raiseMax), now + (this._reduced ? 0 : rand(0, 1600)));
      }
    },

    // Раз в CFG.everyMs: если выдвинутых меньше нормы — выдвигаем случайный,
    // иначе задвигаем случайный. Так стена всё время "дышит", но не пустеет и не забивается.
    spawnMove(now) {
      const t = this._t;
      let raised = 0;
      for (const tile of t.tiles) if (tile.to > 0) raised++;
      const wantUp = raised < t.tiles.length * CFG.raisedShare;

      for (let tries = 0; tries < 30; tries++) {
        const i = Math.floor(Math.random() * t.tiles.length);
        if (t.moving.has(i) || wantUp === t.tiles[i].to > 0) continue;
        this.moveTile(i, wantUp ? rand(CFG.raiseMin, CFG.raiseMax) : 0, now);
        return;
      }
    },

    update(now) {
      const t = this._t;
      if (!this._reduced && now - t.lastSpawn > CFG.everyMs) {
        t.lastSpawn = now;
        this.spawnMove(now);
      }
      for (const i of t.moving) {
        const tile = t.tiles[i];
        const p = Math.min(1, Math.max(0, (now - tile.t0) / tile.dur));
        tile.raise = tile.from + (tile.to - tile.from) * easeInOutCubic(p);
        this.placeTile(tile, i, now);
        if (p >= 1) t.moving.delete(i);
      }

      // Ореолы стоящих выдвинутых кубиков "дышат" — у них меняем только яркость.
      for (let i = 0; i < t.tiles.length; i++) {
        const tile = t.tiles[i];
        if (tile.raise > 0 && !t.moving.has(i)) this.tintHalo(tile, i, now);
      }
      this.flush();
    },

    /* ---------- камера и мышь ---------- */

    onPointer(e) {
      const p = this._t && this._t.pointer;
      if (!p) return;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },

    // Камера плавно догоняет мышь (0.04 за кадр) — отсюда мягкий параллакс.
    updateCamera(instant) {
      const t = this._t;
      const k = instant ? 1 : 0.04;
      t.cam.x += (t.pointer.x * CFG.parallax - t.cam.x) * k;
      t.cam.y += (t.pointer.y * CFG.parallax - t.cam.y) * k;
      t.camera.position.set(t.cam.x, t.cam.y, t.dist);
      t.camera.lookAt(0, 0, 0);
    },

    draw() {
      this._t.composer.render();
    },

    /* ---------- управление ---------- */

    start() {
      const t = this._t;
      if (!t || t.running) return;
      t.running = true;
      const now = performance.now();
      if (!t.started) {
        t.started = true;
        this.wave(now);
      }
      const loop = (time) => {
        if (!t.running) return;
        this._raf = requestAnimationFrame(loop);
        this.update(time);
        this.updateCamera(false);
        this.draw();
      };
      this._raf = requestAnimationFrame(loop);
    },

    // Слайд уехал — не рисуем вообще, видеокарта отдыхает.
    stop() {
      if (this._t) this._t.running = false;
      cancelAnimationFrame(this._raf);
    },

    dispose() {
      const t = this._t;
      if (!t) return;
      t.meshes.forEach((m) => m.dispose());
      if (t.glowMesh) t.glowMesh.dispose();
      t.plainMat.map.dispose();
      t.hatchMat.map.dispose();
      t.glowMat.map.dispose();
      [t.tileGeo, t.glowGeo, t.plainMat, t.hatchMat, t.glowMat].forEach((o) => o.dispose());
      if (t.composer.dispose) t.composer.dispose();
      t.renderer.dispose();
      this._t = null;
    },
  },
};
</script>

<style scoped>
.tile-wall {
  position: absolute;
  inset: 0;
}

.tile-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.label {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 11px;
  line-height: 1.35;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
}

.dash {
  display: block;
  width: 18px;
  height: 1px;
  margin-top: 8px;
  background: currentColor;
}

@media (max-width: 1000px) {
  .labels { display: none; }
}
</style>
