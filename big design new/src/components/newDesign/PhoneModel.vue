<template>
  <!--
    3D-модель телефона (public/3d/phone.glb): парит, поворачивается, на экране — шаг курса.
    Слой на весь родитель: телефон стоит в месте из CSS-переменной --phone-rest, при focused
    выезжает в --phone-focus, и клавиши из buttons работают как кнопки (событие pick).
    Если WebGL недоступен или модель не загрузилась — показываем старое видео (fallbackSrc).
    Проп active: true — анимируем, false — не рисуем вообще. ?freeze в адресе — замирает анфас.
  -->
  <div
    ref="root"
    class="phone"
    :class="{ 'is-ready': mode === '3d' }"
    @click="onClick"
    @pointermove="onHover"
    @pointerleave="onHoverEnd"
  >
    <canvas v-show="mode !== 'video'" ref="canvas" class="phone-canvas"></canvas>
    <video
      v-if="mode === 'video'"
      ref="fallback"
      class="phone-fallback"
      :style="videoBox"
      :src="fallbackSrc"
      muted
      loop
      playsinline
      preload="auto"
    ></video>
  </div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

// Все настройки телефона — в одном месте.
const CFG = {
  model: "/3d/phone.glb",
  fov: 18,            // угол объектива. Меньше = "длиннее" объектив, меньше искажений
  baseTilt: -0.08,    // постоянный наклон по диагонали, радианы
  swayYaw: 0.24,      // поворот влево-вправо, радианы (~14°)
  swaySpeed: 0.45,    // скорость поворота
  bob: 0.03,          // покачивание вверх-вниз, в долях высоты телефона
  mouse: 0.1,         // насколько телефон дополнительно поворачивается к мыши
  faceExtra: 0,       // ручная поправка разворота, радианы (Math.PI — развернуть спиной)
  phoneWidth: 1.6,    // ширина телефона с запасом на поворот при высоте 2 — чтобы не вылез за своё место
  // Холст — не на весь экран, а рамка вокруг телефона (в единицах сцены при высоте телефона 2),
  // с запасом на повороты, наклон и покачивание. Полноэкранный холст стоил ~20 мс кадра.
  canvasW: 1.8,
  canvasH: 2.3,

  // --- выезд в центр ---
  focusSway: 0.05,    // в центре телефон почти не качается — по клавишам легко попасть
  focusMouse: 0.05,
  swing: 0.45,        // разворот по дороге, радианы: телефон выезжает чуть боком
  stillMs: 300,       // замирание анфас перед нырком в экран

  // --- кнопки ---
  accent: 0x4d7dff,
  pressMs: 420,       // нажатие целиком: вниз и обратно
  pressDepth: 0.012,  // ход клавиши (высота телефона = 2). Больше — клавиша целиком уходит под рамку
  pressNudge: 0.18,   // телефон слегка отклоняется от нажатия, как от пальца
  // Яркость подсветки кнопки (0..1) в разных состояниях; берётся самая яркая, нажатие добавляется сверху.
  light: { breathe: 0.18, hover: 0.8, selected: 0.55, press: 0.6 },
  breatheSpeed: 0.0025, // «дыхание» кнопок в центре, рад/мс; соседние сдвинуты по фазе
  keyGlow: 0.25,        // свечение самой клавиши при полной подсветке (emissive)

  // --- материалы ---
  metalColor: 0x9aa0a8,   // алюминий: темнее, чем кажется — светлым его делает отражение
  // Карта шероховатости — отпечатки, разводы, потёртости (яркость ~0.71).
  // Именно неравномерность поверхности отличает "фото" от "игрушки".
  // Подбиралось сравнением трёх вариантов; альтернатива — ?map=metal_rough&rough=1.7
  // (чистый сатинированный металл, но выглядит слишком новым).
  roughMap: "/3d/tex/smudges.jpg",
  metalRoughness: 0.75,   // множитель поверх карты: итоговая шероховатость ~0.5 — сатин
  detailRepeat: 4,        // сколько раз карта повторяется по корпусу: больше — мельче разводы
  normalStrength: 0.12,   // глубина микрорельефа (литьё, мелкие царапины)
  keyColor: 0x23262b,     // клавиши
  envIntensity: 1.25,     // сила отражений окружения на металле
  exposure: 1.0,
};

// Экран телефона: шаг курса пиксельным шрифтом, со строками развёртки.
const SCREEN = {
  font: "VT323",      // пиксельный "терминальный" шрифт (подключён в index.html)
  w: 1024,            // ширина текстуры экрана, px (высота — по пропорциям экрана модели)
  color: "#dfe6ff",
  glow: "#4d7dff",
  glowBlur: 18,
  bg: "#05070c",
  dim: "#8e9ab5",     // вторичный текст
  // Где раскладывать текст, в долях текстуры: низ меша прячется под рамкой корпуса.
  area: { top: 0.06, bottom: 0.56 },
  // Окно, которое реально видно сквозь рамку (подобрано по модели) — для нырка в экран.
  window: { top: 0, bottom: 0.62, right: 0.934 },
  step: { label: 46, title: 104, line: 42, meta: 40 }, // кегли на экране шага
  // Смена шага: экран гаснет, в темноте меняется картинка, разгорается. Яркость — цвет материала,
  // без перерисовки: каждая перерисовка — это заливка большой текстуры, ~1 рывок кадра.
  flickerMs: 320,
  swapAt: 0.25,       // доля flickerMs: самый тёмный момент, тут меняем картинку
};

// Иконки на клавишах: имя → [ряд, колонка] клавиатуры 3×3 с левого верхнего угла.
// Файл — /3d/tex/icon_<имя>.png. Кнопками (проп buttons) годятся только отдельные клавиши:
// клавиша с карандашом склеена в модели с двумя соседними и отдельно не нажимается.
const ICONS = {
  list: [0, 0],
  pencil: [0, 2],
  target: [1, 2],
  person: [2, 1],
};
const ICON_IDLE = new THREE.Color(0xc9d3e6);
const ICON_LIT = new THREE.Color(0xffffff);
const ICON_DIM = new THREE.Color(0x5d6678); // иконки-декор, пока телефон в центре

// Студийное окружение: тёмная комната с несколькими яркими источниками.
// [ширина, высота, позиция, цвет, яркость]
const STUDIO = [
  [7, 4, [-5, 4, 5], 0xffffff, 5],     // большой мягкий свет слева сверху
  [0.7, 9, [5, 1.5, 3], 0xffffff, 10], // узкая полоса справа — вытянутый блик на металле
  [0.6, 7, [-3, 0, -4], 0x8fa6c8, 5],  // полосы сзади — контурный свет по рёбрам,
  [0.6, 7, [3, 0, -4], 0x6f8fc0, 3],   // чуть холодный, но не синий неон
  [5, 5, [2.5, -3, 2], 0x2f6bff, 1.0], // лёгкий синий рефлекс снизу
];

// Ход нажатия во времени (u от 0 до 1): быстро вниз за первые 20%, плавно обратно.
function pressCurve(u) {
  if (!(u > 0 && u < 1)) return 0;
  return u < 0.2 ? Math.sin((u / 0.2) * (Math.PI / 2)) : Math.cos(((u - 0.2) / 0.8) * (Math.PI / 2));
}

// Яркость экрана при смене шага (u от 0 до 1): быстро гаснет до swapAt, потом разгорается.
function flickerCurve(u) {
  const { swapAt } = SCREEN;
  if (!(u > 0 && u < 1)) return 1;
  if (u < swapAt) return 1 - 0.88 * (u / swapAt);
  return 0.12 + 0.88 * (1 - (1 - (u - swapAt) / (1 - swapAt)) ** 3);
}

export default {
  name: "PhoneModel",
  props: {
    active: { type: Boolean, default: false },
    // Телефон выехал в центр: клавиши-кнопки работают.
    focused: { type: Boolean, default: false },
    focusMs: { type: Number, default: 1100 },
    // Перед нырком в экран (AboutReveal): телефон замирает строго анфас.
    diving: { type: Boolean, default: false },
    // Какую часть высоты своего места занимает телефон.
    fill: { type: Number, default: 0.62 },
    // Шаг на экране: { index, total, title, lines }.
    screen: { type: Object, required: true },
    // Имена иконок (см. ICONS), чьи клавиши — кнопки шагов. Номер в массиве = номер шага.
    buttons: { type: Array, default: () => [] },
    // Старое видео с девайсом — показываем, если 3D не получилось.
    fallbackSrc: { type: String, default: "" },
  },
  emits: ["mode", "pick"],
  data() {
    return {
      mode: "loading", // loading → 3d | video
      videoBox: null,  // место запасного видео (то же, что у телефона)
    };
  },
  watch: {
    // Сообщаем родителю, что показываем: 3D или запасное видео.
    mode(m) {
      this.$emit("mode", m);
    },
    active(on) {
      if (on) this.start();
      else this.stop();
    },
    // Выезд начинается с того места, где телефон сейчас, — даже если прошлый ещё не доехал.
    focused(on) {
      const t = this._t;
      if (!t) return;
      const now = performance.now();
      t.focusAnim = { from: this.focusAt(now), to: on ? 1 : 0, start: now };
      // Телефон уезжает из-под мыши: старое наведение больше не верно, обновится при движении.
      t.hover = -1;
      this.$refs.root.style.cursor = "";
      if (!t.running) this.draw(now);
    },
    diving(on) {
      const t = this._t;
      if (!t) return;
      const now = performance.now();
      t.stillAnim = { from: this.stillAt(now), to: on ? 1 : 0, start: now };
    },
    screen(next, prev) {
      const t = this._t;
      if (!t) return;
      const now = performance.now();
      if (next?.index !== prev?.index) {
        this.press(next?.index, now);
        if (t.screen) t.screen.since = now; // экран мигает, картинка сменится в темноте
      }
      this.paintScreen(now);
      if (!t.running) this.draw(now);
    },
  },
  async mounted() {
    this._alive = true;
    const q = new URLSearchParams(location.search);
    this._freeze = import.meta.env.DEV && q.has("freeze");
    this._reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Для разработки: настройки материала можно крутить прямо в адресе, без правок кода.
    // Например: ?slide=1&freeze&rough=0.3&repeat=6&normal=0.15&env=1.4
    if (import.meta.env.DEV) {
      const num = (name, key) => { if (q.has(name)) CFG[key] = Number(q.get(name)); };
      num("rough", "metalRoughness");
      num("repeat", "detailRepeat");
      num("normal", "normalStrength");
      num("env", "envIntensity");
      num("fov", "fov");
      if (q.has("map")) CFG.roughMap = `/3d/tex/${q.get("map")}.jpg`;
    }
    // Как и в TileWall: всё от Three.js держим в this._t, не в data() —
    // иначе Vue обернёт тысячи объектов в реактивные прокси.
    let ok = true;
    try {
      this.init();
      await this.load();
    } catch (e) {
      console.warn("PhoneModel: 3D не получилось, показываю видео", e);
      this.dispose();
      ok = false;
    }
    // Загрузка идёт долго: за это время компонент могли снять — тогда всё уже освобождено.
    if (!this._alive) return this.dispose();
    this.mode = ok ? "3d" : "video";
    this.resize();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(this.$refs.root);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    await this.$nextTick(); // запасное <video> появляется в DOM только после перерисовки
    if (this.active) this.start();
    else this.draw(performance.now());
  },
  unmounted() {
    this._alive = false;
    this.stop();
    this._ro?.disconnect();
    window.removeEventListener("pointermove", this.onPointer);
    this.dispose();
  },
  methods: {
    init() {
      const renderer = new THREE.WebGLRenderer({
        canvas: this.$refs.canvas,
        antialias: true,
        alpha: true, // прозрачный фон — телефон висит прямо над сценой слайда
        powerPreference: "high-performance",
      });
      // 2 — уже избыточно: деталей модели от этого не прибавляется, а пикселей вдвое больше.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = CFG.exposure;
      // Тени модели на себя съедают ~20% кадра, а на этом освещении почти не читаются:
      // свет тут в основном отражённый. По умолчанию выключены, для сравнения — ?shadow.
      renderer.shadowMap.enabled = import.meta.env.DEV && new URLSearchParams(location.search).has("shadow");
      renderer.shadowMap.type = THREE.PCFShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(CFG.fov, 1, 0.1, 100);
      // stage — где телефон стоит на холсте (сбоку или в центре), pivot внутри — парение и наклоны.
      const stage = new THREE.Group();
      scene.add(stage);
      const focus = this.focused ? 1 : 0;
      // Собираем _t до тяжёлой части: если она упадёт, dispose() найдёт и закроет контекст.
      this._t = {
        renderer, scene, camera, stage,
        pivot: null, screen: null, glowTex: null,
        body: null, pad: null,          // рамки корпуса и клавиатуры — для попаданий указателя
        buttons: [], decor: [], hover: -1,
        slots: {
          rest: { pos: new THREE.Vector3(), scale: 1 },
          focus: { pos: new THREE.Vector3(), scale: 1 },
        },
        focusAnim: { from: focus, to: focus, start: 0 }, // выезд в центр: откуда, куда, когда начался
        stillAnim: { from: 0, to: 0, start: 0 },         // замирание перед нырком в экран
        screenBox: null,                                 // рамка меша экрана в координатах pivot
        view: { w: 1, h: 1 },             // весь слой, px — "кадр", из которого холст показывает кусок
        box: { w: 1, h: 1 },              // размер холста, px
        offset: { x: NaN, y: NaN },       // где сейчас холст в слое, px
        running: false,
        pointer: { x: 0, y: 0 }, look: { x: 0, y: 0 },
        // Для проверки попаданий: создаём один раз, а не на каждое движение мыши.
        raycaster: new THREE.Raycaster(), ray: new THREE.Ray(), inv: new THREE.Matrix4(),
        ndc: new THREE.Vector2(), hitPoint: new THREE.Vector3(),
      };

      scene.environment = this.makeStudioEnv(renderer);
      scene.environmentIntensity = 1;

      // Металл почти целиком состоит из отражений окружения, поэтому основной
      // "свет" — это студийные панели в makeStudioEnv. Прямой источник нужен
      // ради теней и подсветки тёмных мест.
      const sun = new THREE.DirectionalLight(0xffffff, 1.6);
      sun.position.set(-2.5, 4, 3);
      if (renderer.shadowMap.enabled) {
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.bias = -0.0008;
        sun.shadow.normalBias = 0.01;
        Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.5, far: 12 });
        sun.shadow.camera.updateProjectionMatrix();
      }
      scene.add(sun, sun.target);
    },

    // Окружение решает, как выглядит металл: он почти целиком состоит из отражений.
    // RoomEnvironment из Three.js — ровная белая коробка, от неё металл выходит
    // молочным и плоским. Собираем свою "студию": тёмная комната и несколько
    // ярких панелей. Их отражения дают контраст и длинные блики.
    makeStudioEnv(renderer) {
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x05070b);
      STUDIO.forEach(([w, h, pos, color, power]) => {
        const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false, side: THREE.DoubleSide });
        mat.color.multiplyScalar(power); // яркость больше 1 — это источник света, а не бумага
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        panel.position.set(...pos);
        panel.lookAt(0, 0, 0);
        envScene.add(panel);
      });

      const pmrem = new THREE.PMREMGenerator(renderer);
      const tex = pmrem.fromScene(envScene, 0.02).texture;
      pmrem.dispose();
      envScene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      this._envTex = tex;
      return tex;
    },

    async load() {
      const t = this._t;
      // Шрифт экрана должен успеть загрузиться, иначе canvas нарисует запасной.
      try {
        await document.fonts.load(`${SCREEN.step.title}px "${SCREEN.font}"`);
      } catch (_) { /* нет шрифта — будет monospace, не страшно */ }

      const loader = new GLTFLoader();
      // Модель сжата meshopt — нужен декодер.
      loader.setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(CFG.model);
      const model = gltf.scene;

      const { keys, display } = this.setupMaterials(model);

      // Иерархия: stage (место на холсте) → pivot (парение) → holder (разворот, масштаб, центр) → модель.
      const holder = new THREE.Group();
      holder.add(model);
      holder.rotation.y = this.faceCamera(model, display);

      // Нормируем: высота телефона = 2 единицы, центр — в нуле.
      const rawSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
      holder.scale.setScalar(2 / rawSize.y);
      const center = new THREE.Box3().setFromObject(holder).getCenter(new THREE.Vector3());
      holder.position.sub(center);

      const pivot = new THREE.Group();
      pivot.rotation.order = "YXZ"; // сначала наклон, потом поворот вокруг вертикали
      pivot.add(holder);
      t.stage.add(pivot);
      t.pivot = pivot;
      // stage и pivot пока без сдвигов и поворотов: мировые координаты = координаты pivot ("анфас").
      // В них считаем экран, рамки корпуса и клавиш.
      t.scene.updateMatrixWorld(true);
      t.body = new THREE.Box3().setFromObject(holder);
      t.glowTex = this.makeGlowTexture();

      if (display) {
        const aspect = this.mapScreenUV(display);
        display.material = new THREE.MeshBasicMaterial({ map: this.makeScreen(aspect), toneMapped: false });
        t.screen.material = display.material; // его цветом гасим экран при смене шага
        t.screenBox = new THREE.Box3().setFromObject(display); // для screenSnapshot (нырок в экран)
      }
      this.setupKeys(keys);
      this.addShadow();
    },

    // Экран модели смотрит вбок (так сохранилось из Cinema 4D).
    // Смотрим, куда направлена нормаль экрана (перпендикуляр к его поверхности),
    // и поворачиваем модель вокруг вертикали так, чтобы она смотрела в камеру (+z).
    faceCamera(model, display) {
      if (!display) return CFG.faceExtra;
      model.updateMatrixWorld(true);

      const attr = display.geometry.attributes.normal;
      const n = new THREE.Vector3();
      const v = new THREE.Vector3();
      for (let i = 0; i < attr.count; i++) n.add(v.fromBufferAttribute(attr, i));
      const hasNormal = n.length() / attr.count > 0.1;
      n.transformDirection(display.matrixWorld);

      const all = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      const off = new THREE.Box3().setFromObject(display).getCenter(new THREE.Vector3()).sub(all);
      off.y = 0;
      if (!hasNormal) n.copy(off).normalize();
      else if (n.dot(off) < 0 && off.length() > 0.02) n.negate(); // нормаль вывернута

      const angle = -Math.atan2(n.x, n.z) + CFG.faceExtra;
      if (import.meta.env.DEV) {
        const f = (a) => a.toArray().map((x) => x.toFixed(2)).join(", ");
        console.info(`[PhoneModel] экран: нормаль (${f(n)}), поворот ${Math.round((angle * 180) / Math.PI)}°`);
      }
      return angle;
    },

    // Материалы. ВАЖНО: у корпуса и клавиш родные материалы из модели НЕ выбрасываем —
    // в них лежат карты шероховатости и затенения (grunge, отпечатки, грязь в углублениях).
    // Без них металл идеально ровный, и модель выглядит игрушечной.
    // Мы только правим у них цвет и общие настройки.
    setupMaterials(model) {
      const keys = [];
      let display = null;

      // Карты поверхности. Берём твои исходные текстуры, а не ту, что положил
      // конвертер: в ней затенение = 0 (это гасило ВСЕ отражения и делало металл
      // плоской краской), шероховатость = 1 ровно по всей площади, то есть ноль деталей.
      const tex = (url, repeat) => {
        const t = new THREE.TextureLoader().load(url);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeat, repeat);
        return t;
      };
      const surface = tex(CFG.roughMap, CFG.detailRepeat);
      const bumps = tex("/3d/tex/metal_normal.jpg", CFG.detailRepeat);

      const tuneMetal = (mat, isKey) => {
        mat.color.set(isKey ? CFG.keyColor : CFG.metalColor);

        // Отключаем всё, что пришло из конвертера, и ставим своё.
        mat.metalnessMap = null;
        mat.aoMap = null;
        mat.roughnessMap = surface;   // мелкая фактура металла
        mat.normalMap = bumps;        // микрорельеф: литьё и мелкие царапины
        mat.normalScale.set(CFG.normalStrength, CFG.normalStrength);

        mat.metalness = isKey ? 0.25 : 1;
        // roughness — множитель поверх карты: число задаёт уровень, карта его "пачкает".
        mat.roughness = isKey ? 1 : CFG.metalRoughness;
        mat.envMapIntensity = CFG.envIntensity;
        mat.needsUpdate = true;
      };

      model.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;

        if (/^display$/i.test(o.name)) {
          display = o;
          o.castShadow = false;
        } else if (/glass/i.test(o.name)) {
          // Стекло поверх экрана: почти прозрачное, только блик по краю.
          o.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0.02,
            transparent: true,
            opacity: 0.08,
            envMapIntensity: 2.5,
            depthWrite: false,
          });
          o.castShadow = false;
        } else if (/lamp/i.test(o.name)) {
          // Лампочки внизу — светятся холодным белым.
          o.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xdfe8ff,
            emissiveIntensity: 1.6,
            roughness: 0.4,
          });
          o.castShadow = false;
        } else if (/^main_body/i.test(o.name)) {
          tuneMetal(o.material, true);
          keys.push(o);
        } else {
          tuneMetal(o.material, false);
        }
      });
      return { keys, display };
    },

    // Развёртка (UV) экрана из C4D сжимает картинку почти в точку — делаем свою:
    // модель уже стоит экраном к камере, поэтому проецируем "в лоб":
    // x вершины → горизонталь картинки, y → вертикаль. Возвращаем пропорции экрана.
    mapScreenUV(mesh) {
      const pos = mesh.geometry.attributes.position;
      const v = new THREE.Vector3();
      const xs = new Float32Array(pos.count);
      const ys = new Float32Array(pos.count);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        xs[i] = v.x;
        ys[i] = v.y;
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      }
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = (xs[i] - minX) / (maxX - minX);
        uv[i * 2 + 1] = (ys[i] - minY) / (maxY - minY);
      }
      mesh.geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      return (maxX - minX) / (maxY - minY);
    },

    // Экран рисуется на canvas, а canvas работает как текстура.
    makeScreen(aspect) {
      const w = SCREEN.w;
      const h = Math.round(w / aspect); // высота под пропорции экрана — буквы не растянуты

      // Строки развёртки: тонкие тёмные полосы через каждые 4px.
      // Готовим их один раз целым слоем — заливка узором по всей площади при каждой
      // перерисовке экрана стоила десятки миллисекунд.
      const tile = document.createElement("canvas");
      tile.width = tile.height = 4;
      const tileCtx = tile.getContext("2d");
      tileCtx.fillStyle = "rgba(0,0,0,0.35)";
      tileCtx.fillRect(0, 0, 4, 1);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.textBaseline = "middle";

      const scan = document.createElement("canvas");
      scan.width = w;
      scan.height = h;
      const scanCtx = scan.getContext("2d");
      scanCtx.fillStyle = scanCtx.createPattern(tile, "repeat");
      scanCtx.fillRect(0, 0, w, h);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;

      // since — когда началась смена шага (мигание); material — материал экрана, ставит load().
      this._t.screen = { ctx, tex, w, h, scan, state: "", since: -Infinity, material: null };
      this.paintScreen(0);
      return tex;
    },

    // Экран шага курса: номер, название, короткие строки и прогресс.
    // Canvas перерисовывается и заново уходит в видеокарту, только когда шаг сменился.
    paintScreen(now) {
      const layer = this._t?.screen;
      if (!layer) return;
      const { index, total, title, lines = [] } = this.screen;
      const state = `${index}:${title}`;
      if (state === layer.state) return;
      // Идёт мигание — меняем картинку, только когда экран погас (если цикл стоит — сразу).
      if (this._t.running && now - layer.since < SCREEN.flickerMs * SCREEN.swapAt) return;
      layer.state = state;

      const { ctx, w, h } = layer;
      const top = h * SCREEN.area.top;
      const band = h * (SCREEN.area.bottom - SCREEN.area.top);
      const pad = w * 0.1;

      ctx.shadowBlur = 0;
      ctx.fillStyle = SCREEN.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.textAlign = "left";
      ctx.shadowColor = SCREEN.glow;

      ctx.font = `${SCREEN.step.label}px "${SCREEN.font}", monospace`;
      ctx.fillStyle = SCREEN.dim;
      ctx.fillText(this.screen.label ?? `STEP ${index + 1}`, pad, top + band * 0.12);

      ctx.font = `${SCREEN.step.title}px "${SCREEN.font}", monospace`;
      ctx.fillStyle = SCREEN.color;
      ctx.shadowBlur = SCREEN.glowBlur;
      ctx.fillText(title, pad, top + band * 0.33);
      ctx.shadowBlur = 0;

      ctx.font = `${SCREEN.step.line}px "${SCREEN.font}", monospace`;
      ctx.fillStyle = SCREEN.dim;
      lines.forEach((line, n) => ctx.fillText(line, pad, top + band * (0.55 + n * 0.11)));

      // Прогресс: полоска слева, счётчик справа. У служебного экрана (index < 0) его нет.
      if (index >= 0) {
        const barY = top + band * 0.9;
        const barW = w * 0.32;
        ctx.fillStyle = "rgba(160,178,214,0.25)";
        ctx.fillRect(pad, barY, barW, 5);
        ctx.fillStyle = SCREEN.color;
        ctx.fillRect(pad, barY, (barW * (index + 1)) / total, 5);
        ctx.font = `${SCREEN.step.meta}px "${SCREEN.font}", monospace`;
        ctx.fillStyle = SCREEN.dim;
        ctx.textAlign = "right";
        ctx.fillText(`0${index + 1} / 0${total}`, w - pad, barY);
      }

      ctx.drawImage(layer.scan, 0, 0);
      layer.tex.needsUpdate = true;
    },

    // Мягкое круглое пятно: ореол кнопок и тень под телефоном (цвет задаёт материал).
    makeGlowTexture() {
      const size = 128;
      const r = size / 2;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
      gradient.addColorStop(0, "#fff");
      gradient.addColorStop(0.7, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(canvas);
    },

    // Мягкая тень у нижнего края телефона — чтобы он не висел в пустоте.
    // Висит на stage: ездит вместе с телефоном, но не качается. Рисуется поверх модели.
    addShadow() {
      const t = this._t;
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.08, 0.15),
        new THREE.MeshBasicMaterial({
          map: t.glowTex,
          color: 0x000000,
          transparent: true,
          opacity: 0.7,
          depthTest: false,
          depthWrite: false,
        })
      );
      shadow.position.y = -0.93;
      shadow.renderOrder = 3;
      t.stage.add(shadow);
    },

    // Клавиатура 3×3: общая рамка всех клавиш, поделённая на ячейки. По ячейкам ставим иконки,
    // находим меши кнопок и потом узнаём, по какой клавише попал указатель.
    setupKeys(keys) {
      if (!keys.length) return;
      const t = this._t;
      const box = new THREE.Box3();
      keys.forEach((k) => box.union(new THREE.Box3().setFromObject(k)));
      const size = box.getSize(new THREE.Vector3());
      t.pad = { box, cellW: size.x / 3, cellH: size.y / 3 };

      const meshes = this.keysByCell(keys);
      const loader = new THREE.TextureLoader();
      Object.entries(ICONS).forEach(([name, [row, col]]) => {
        const cell = row * 3 + col;
        const icon = this.addIcon(loader, name, cell);
        const index = this.buttons.indexOf(name);
        if (index >= 0) t.buttons[index] = this.makeButton(icon, meshes[cell], cell);
        else t.decor.push(icon);
      });
    },

    // Центр ячейки клавиатуры в координатах pivot.
    cellCenter(cell) {
      const { box, cellW, cellH } = this._t.pad;
      return {
        x: box.min.x + cellW * ((cell % 3) + 0.5),
        y: box.max.y - cellH * (Math.floor(cell / 3) + 0.5),
      };
    },

    // Ячейка под точкой (x, y) в координатах pivot. Края и щели — к ближайшей клавише.
    cellAt(x, y) {
      const { box, cellW, cellH } = this._t.pad;
      const clamp = (v) => Math.min(2, Math.max(0, Math.floor(v)));
      return clamp((box.max.y - y) / cellH) * 3 + clamp((x - box.min.x) / cellW);
    },

    // Какой меш клавиши в какой ячейке. Меш шире ячейки — это склеенные клавиши, их не нажать.
    keysByCell(keys) {
      const { cellW, cellH } = this._t.pad;
      const byCell = [];
      const box = new THREE.Box3();
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      keys.forEach((k) => {
        box.setFromObject(k).getSize(size);
        if (size.x > cellW * 1.5 || size.y > cellH * 1.5) return;
        box.getCenter(center);
        byCell[this.cellAt(center.x, center.y)] = k;
      });
      return byCell;
    },

    addIcon(loader, name, cell) {
      const t = this._t;
      const { box, cellW, cellH } = t.pad;
      const s = Math.min(cellW, cellH) * 0.5;
      const mat = new THREE.MeshBasicMaterial({ transparent: true, color: ICON_IDLE, toneMapped: false, depthWrite: false });
      const icon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      const { x, y } = this.cellCenter(cell);
      icon.position.set(x, y, box.max.z + 0.004); // чуть над поверхностью клавиш
      icon.scale.set(s, s, 1);
      icon.renderOrder = 2; // поверх ореола кнопки
      mat.map = loader.load(`/3d/tex/icon_${name}.png`, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        icon.scale.x = s * (tex.image.width / tex.image.height); // пропорции иконки
        mat.needsUpdate = true;
        if (!t.running) this.draw(performance.now());
      });
      t.pivot.add(icon);
      return icon;
    },

    // Кнопка = иконка + ореол + клавиша (если она отдельный меш). Материал клавиши копируем:
    // он общий для всех клавиш, а светиться должна только эта.
    makeButton(icon, key, cell) {
      const t = this._t;
      const { box, cellW, cellH } = t.pad;
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: t.glowTex,
          color: CFG.accent,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })
      );
      glow.position.set(icon.position.x, icon.position.y, box.max.z + 0.002);
      glow.scale.setScalar(Math.min(cellW, cellH) * 1.7);
      glow.renderOrder = 1;
      t.pivot.add(glow);

      const button = { cell, icon, glow, iconZ: icon.position.z, pressAt: -Infinity, key: null };
      if (key) {
        key.material = key.material.clone();
        key.material.emissive.set(CFG.accent);
        key.material.emissiveIntensity = 0;
        // Ход задан в координатах pivot (от экрана — это -z), а двигать меш надо в координатах его родителя.
        const center = new THREE.Box3().setFromObject(key).getCenter(new THREE.Vector3());
        const from = key.parent.worldToLocal(center.clone());
        const to = key.parent.worldToLocal(center.setZ(center.z - CFG.pressDepth));
        button.key = { mesh: key, rest: key.position.clone(), push: to.sub(from) };
      }
      return button;
    },

    // Нажать кнопку шага: ход клавиши и вспышка.
    press(index, now) {
      const button = this._t?.buttons[index];
      if (button) button.pressAt = now;
    },

    // Свет и ход кнопок на текущий кадр. f — насколько телефон в центре.
    // Возвращает толчок телефона от нажатия (добавка к наклону и повороту).
    animateButtons(now, f) {
      const t = this._t;
      const nudge = { pitch: 0, yaw: 0 };
      t.decor.forEach((icon) => icon.material.color.lerpColors(ICON_IDLE, ICON_DIM, f));
      const L = CFG.light;
      t.buttons.forEach((b, i) => {
        const press = pressCurve((now - b.pressAt) / CFG.pressMs);
        // В центре кнопки по очереди «дышат» — видно, что их можно нажать.
        const breathe = f * L.breathe * (0.5 + 0.5 * Math.sin(now * CFG.breatheSpeed - i * 1.4));
        const hover = this.focused && i === t.hover ? L.hover : 0;
        const selected = i === this.screen?.index ? L.selected : 0;
        const light = Math.min(1, Math.max(breathe, hover, selected) + press * L.press);

        b.glow.material.opacity = light;
        b.icon.material.color.lerpColors(ICON_IDLE, ICON_LIT, light);
        b.icon.position.z = b.iconZ - CFG.pressDepth * press;
        if (b.key) {
          b.key.mesh.position.copy(b.key.rest).addScaledVector(b.key.push, press);
          b.key.mesh.material.emissiveIntensity = light * CFG.keyGlow;
        }
        // Нажали ниже центра — низ уходит от нас, правее — правый край.
        nudge.pitch -= b.icon.position.y * CFG.pressNudge * press;
        nudge.yaw += b.icon.position.x * CFG.pressNudge * press;
      });
      return nudge;
    },

    // Насколько телефон замер перед нырком: 0 — обычное парение, 1 — неподвижен анфас.
    stillAt(now) {
      const { from, to, start } = this._t.stillAnim;
      const u = Math.min(1, (now - start) / CFG.stillMs);
      return from + (to - from) * (1 - (1 - u) ** 3);
    },

    // Для нырка в экран (AboutReveal): где на странице окно экрана и что в нём нарисовано.
    // Окно — SCREEN.window текстуры: края меша экрана прячутся под рамкой корпуса.
    screenSnapshot() {
      const t = this._t;
      const box = t?.screenBox;
      if (!box || !t.screen) return null;
      const win = SCREEN.window;
      const height = box.max.y - box.min.y;
      const top = box.max.y - height * win.top;
      const bottom = box.max.y - height * win.bottom;
      const right = box.min.x + (box.max.x - box.min.x) * win.right;
      const canvas = this.$refs.canvas.getBoundingClientRect();
      const v = new THREE.Vector3();
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const x of [box.min.x, right]) {
        for (const y of [top, bottom]) {
          v.set(x, y, box.max.z).applyMatrix4(t.pivot.matrixWorld).project(t.camera);
          const px = canvas.left + ((v.x + 1) / 2) * canvas.width;
          const py = canvas.top + ((1 - v.y) / 2) * canvas.height;
          minX = Math.min(minX, px); maxX = Math.max(maxX, px);
          minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        }
      }
      const image = t.screen.ctx.canvas;
      return {
        rect: { left: minX, top: minY, width: maxX - minX, height: maxY - minY },
        image,
        crop: {
          sx: 0,
          sy: image.height * win.top,
          sw: image.width * win.right,
          sh: image.height * (win.bottom - win.top),
        },
      };
    },

    // Насколько телефон выехал в центр: 0 — на своём месте, 1 — в центре. Плавно с обоих концов.
    focusAt(now) {
      const { from, to, start } = this._t.focusAnim;
      const ms = this._reducedMotion ? 0 : this.focusMs;
      const u = ms ? Math.min(1, (now - start) / ms) : 1;
      const eased = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2;
      return from + (to - from) * eased;
    },

    // Что под указателем: кнопка (номер шага), корпус или пусто. Проверяем по рамкам в координатах
    // pivot, а не по треугольникам модели: дёшево, и по клавише проще попасть.
    hitTest(e) {
      const t = this._t;
      if (!t?.body) return { type: "none" };
      const rect = this.$refs.canvas.getBoundingClientRect();
      t.ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((e.clientY - rect.top) / rect.height) * 2);
      t.raycaster.setFromCamera(t.ndc, t.camera);
      const ray = t.ray.copy(t.raycaster.ray).applyMatrix4(t.inv.copy(t.pivot.matrixWorld).invert());
      if (t.pad && ray.intersectBox(t.pad.box, t.hitPoint)) {
        const cell = this.cellAt(t.hitPoint.x, t.hitPoint.y);
        const index = t.buttons.findIndex((b) => b?.cell === cell);
        if (index >= 0) return { type: "key", index };
      }
      return ray.intersectBox(t.body, t.hitPoint) ? { type: "body" } : { type: "none" };
    },

    // Клики и наведение ловит весь слой, а не холст: клик мимо телефона — тоже событие ("none").
    onClick(e) {
      const hit = this.hitTest(e);
      // Нажатие видно сразу, даже если шаг уже выбран и экран не поменяется.
      if (this.focused && hit.type === "key") this.press(hit.index, performance.now());
      this.$emit("pick", hit);
    },

    onHover(e) {
      const t = this._t;
      if (!t) return;
      const hit = this.hitTest(e);
      t.hover = hit.type === "key" ? hit.index : -1;
      // Сбоку нажимается весь телефон (выехать в центр), в центре — только кнопки.
      const clickable = this.focused ? hit.type === "key" : hit.type !== "none";
      this.$refs.root.style.cursor = clickable ? "pointer" : "";
    },

    onHoverEnd() {
      if (this._t) this._t.hover = -1;
    },

    // Прямоугольник из CSS-переменной: "left top width height" в процентах слоя. Нет переменной — весь слой.
    readSlot(name) {
      const value = getComputedStyle(this.$refs.root).getPropertyValue(name).trim();
      const [x, y, w, h] = value ? value.split(/\s+/).map((v) => parseFloat(v) / 100) : [0, 0, 1, 1];
      return { x, y, w, h };
    },

    // Где поставить телефон, чтобы он занял fill высоты прямоугольника и не вылез за него по ширине.
    placeIn({ x, y, w, h }, aspect) {
      const scale = Math.min(h * this.fill, (w * this.fill * 2 * aspect) / CFG.phoneWidth);
      const pos = new THREE.Vector3((x + w / 2 - 0.5) * 2 * aspect, (0.5 - y - h / 2) * 2, 0);
      return { pos, scale };
    },

    resize() {
      const rest = this.readSlot("--phone-rest");
      if (this.mode === "video") {
        const pct = (v) => `${v * 100}%`;
        this.videoBox = { left: pct(rest.x), top: pct(rest.y), width: pct(rest.w), height: pct(rest.h) };
        return;
      }
      const t = this._t;
      if (!t) return;
      const w = this.$refs.root.clientWidth;
      const h = this.$refs.root.clientHeight;
      if (!w || !h) return;
      // Камера так далеко, что плоскость z = 0 видна высотой ровно 2 — во весь слой.
      // Тогда масштаб телефона (его высота = 2) — это прямо доля высоты слоя.
      t.camera.position.set(0, 0, 1 / Math.tan(THREE.MathUtils.degToRad(t.camera.fov / 2)));
      t.view = { w, h };
      t.slots.rest = this.placeIn(rest, w / h);
      t.slots.focus = this.placeIn(this.readSlot("--phone-focus"), w / h);

      // Холст — под самый крупный из двух вариантов; h / 2 — пикселей в единице сцены.
      const scale = Math.max(t.slots.rest.scale, t.slots.focus.scale) * (h / 2);
      t.box = { w: Math.ceil(CFG.canvasW * scale), h: Math.ceil(CFG.canvasH * scale) };
      t.renderer.setSize(t.box.w, t.box.h);
      t.offset = { x: NaN, y: NaN }; // пересчитать положение холста в следующем кадре
      if (!t.running) this.draw(performance.now());
    },

    // Холст ездит за телефоном: сдвигаем его CSS-трансформом, а камера показывает в нём
    // нужный кусок воображаемого кадра на весь слой (setViewOffset). Сдвиг — в целых
    // пикселях: на дробных браузер размывает холст.
    placeCanvas() {
      const { camera, stage, view, box, offset } = this._t;
      const x = Math.round((stage.position.x / (2 * (view.w / view.h)) + 0.5) * view.w - box.w / 2);
      const y = Math.round((0.5 - stage.position.y / 2) * view.h - box.h / 2);
      if (x === offset.x && y === offset.y) return;
      this._t.offset = { x, y };
      camera.setViewOffset(view.w, view.h, x, y, box.w, box.h);
      this.$refs.canvas.style.transform = `translate(${x}px, ${y}px)`;
    },

    onPointer(e) {
      const p = this._t?.pointer;
      if (!p) return;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },

    // Парение: синусы с разными скоростями — движение не повторяется "в лоб"
    // и выглядит естественно, как будто телефон висит в воздухе. В центре оно затихает.
    draw(now) {
      const t = this._t;
      if (!t?.pivot) return;
      const { lerp } = THREE.MathUtils;
      const time = this._freeze ? 0 : now / 1000;
      const f = this.focusAt(now);

      const { rest, focus } = t.slots;
      t.stage.position.lerpVectors(rest.pos, focus.pos, f);
      t.stage.scale.setScalar(lerp(rest.scale, focus.scale, f));
      this.placeCanvas();

      t.look.x += (t.pointer.x - t.look.x) * 0.05;
      t.look.y += (t.pointer.y - t.look.y) * 0.05;
      const sway = lerp(CFG.swayYaw, CFG.focusSway, f);
      const mouse = lerp(CFG.mouse, CFG.focusMouse, f);
      const swing = Math.sin(Math.PI * f) * CFG.swing; // боком по дороге, пик — на полпути
      const nudge = this.animateButtons(now, f);
      // Перед нырком в экран всё движение гаснет: телефон встаёт строго анфас (k → 0).
      const k = 1 - this.stillAt(now);
      const yaw = (Math.sin(time * CFG.swaySpeed) * sway + t.look.x * mouse + swing + nudge.yaw) * k;
      const pitch =
        (Math.sin(time * CFG.swaySpeed * 0.7 + 1) * 0.06 * (1 - f * 0.7) - t.look.y * mouse * 0.5 + nudge.pitch) * k;
      t.pivot.rotation.set(pitch, yaw, CFG.baseTilt * (1 - f) * k);
      t.pivot.position.y = Math.sin(time * 0.9) * CFG.bob * 2 * (1 - f * 0.5) * k;

      if (t.running) this.paintScreen(now);
      const screen = t.screen;
      screen?.material?.color.setScalar(flickerCurve((now - screen.since) / SCREEN.flickerMs));
      t.renderer.render(t.scene, t.camera);
    },

    start() {
      // Запасное видео тоже играет только пока слайд на экране.
      if (this.mode === "video") {
        this.$refs.fallback?.play()?.catch(() => {});
        return;
      }
      const t = this._t;
      if (!t || t.running || this.mode !== "3d") return;
      t.running = true;
      const loop = (time) => {
        if (!t.running) return;
        this._raf = requestAnimationFrame(loop);
        this.draw(time);
      };
      this._raf = requestAnimationFrame(loop);
    },

    stop() {
      this.$refs.fallback?.pause();
      if (!this._t) return;
      this._t.running = false;
      cancelAnimationFrame(this._raf);
    },

    dispose() {
      const t = this._t;
      if (!t) return;
      const seen = new Set();
      t.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        [].concat(o.material || []).forEach((m) => {
          if (seen.has(m)) return; // один материал на много мешей — чистим один раз
          seen.add(m);
          Object.values(m).forEach((v) => v && v.isTexture && v.dispose());
          m.dispose();
        });
      });
      if (this._envTex) this._envTex.dispose();
      t.renderer.dispose();
      t.renderer.forceContextLoss(); // dispose() сам контекст не закрывает — он жил бы до закрытия страницы
      this._t = null;
    },
  },
};
</script>

<style scoped>
.phone {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Холст размером с телефон; размер и сдвиг ставит код (resize, placeCanvas).
   Пока модель грузится, он пустой — проявляем, когда первый кадр готов. */
.phone-canvas {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.phone.is-ready .phone-canvas {
  opacity: 1;
}

/* Запасной вариант: старое видео на месте телефона (videoBox). screen — чёрный фон видео
   становится прозрачным; mix-blend-mode стоит на слое в AboutReveal (.device.is-video). */
.phone-fallback {
  position: absolute;
  display: block;
  object-fit: contain;
  transform: scale(1.7);
}
</style>
