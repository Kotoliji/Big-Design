<template>
  <!--
    Второй экран: путь ученика. Слева текст и три шага, справа устройство —
    на его экране тот же шаг, что выбран слева. Клик по устройству или шаг колеса вниз
    выдвигают его в центр (focused): текст уходит, шаги переключаются клавишами на самом устройстве.
    Появление запускает App.vue: prepare() заранее, enter()/leave() при смене слайда.
  -->
  <section ref="panel" class="about" :class="{ 'is-focused': focused }" :style="{ '--focus-ms': `${focusMs}ms` }">
    <SceneLights />

    <!-- Слой устройства на весь экран и под текстом: клики мимо текста достаются телефону.
         is-video: 3D не запустилось, внутри старое видео с чёрным фоном (см. стили). -->
    <div ref="device" class="device reveal" :class="{ 'is-video': phoneMode === 'video' }" aria-hidden="true">
      <PhoneModel
        v-if="prepared"
        ref="phone"
        :active="live"
        :focused="focused"
        :diving="diving"
        :focus-ms="focusMs"
        :fill="phoneFill"
        :screen="phoneScreen"
        :buttons="stepIcons"
        :fallback-src="fallbackSrc"
        @mode="phoneMode = $event"
        @pick="onPick"
      />
    </div>

    <SiteNav class="reveal" />
    <SideLabels class="labels" :items="sideItems" align="right" />

    <div class="copy" :inert="focused">
      <p class="eyebrow reveal">{{ eyebrow }}</p>
      <h2 class="title reveal">{{ title }}</h2>
      <p class="sub reveal">{{ subtitle }}</p>
      <p class="lead reveal">{{ lead }}</p>

      <ul class="steps reveal">
        <li v-for="(step, i) in steps" :key="step.title">
          <button ref="stepButtons" type="button" :class="{ 'is-active': i === activeStep }" @click="select(i)">
            <span class="num">0{{ i + 1 }}</span>
            <span class="name">{{ step.title }}</span>
            <span class="hint">{{ step.hint }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Пока устройство в центре: подсказка и выход. Шаг курса при этом виден на его экране. -->
    <div class="focus-ui" :inert="!focused">
      <p class="eyebrow">{{ focusEyebrow }}</p>
      <p class="focus-title">{{ focusTitle }}</p>
      <p class="lead">{{ focusLead }}</p>
      <!-- Шаг сейчас виден только на экране устройства (canvas) — дублируем его для скринридера. -->
      <p class="sr-only" aria-live="polite">{{ activeStepText }}</p>
      <button ref="back" type="button" class="back" @click="setFocus(false)">
        <span aria-hidden="true">←</span> {{ backLabel }}
      </button>
    </div>

    <!-- Нырок в экран (см. dive): плоская копия экрана телефона и затемнение поверх всего. -->
    <div v-show="diveOn" ref="dive" class="dive" aria-hidden="true">
      <canvas ref="diveCanvas"></canvas>
    </div>
    <div ref="veil" class="dive-veil" aria-hidden="true"></div>
  </section>
</template>

<script>
import { defineAsyncComponent } from "vue";
import SceneLights from "./SceneLights.vue";
import SideLabels from "./SideLabels.vue";
import SiteNav from "./SiteNav.vue";

// Перед нырком в экран: экран успевает мигнуть и сменить надпись, устройство — замереть анфас.
const DIVE_PREP_MS = 380;
// На столько придерживаем шаг колеса, пока слайд проявляется.
const HOLD_MS = 250;

// Шаги курса. lines — то, что видно на экране устройства (коротко: там мелко).
// icon — клавиша устройства, которая включает шаг (см. ICONS в PhoneModel).
const STEPS = [
  {
    title: "Basics",
    hint: "Knowledge and foundation",
    icon: "list",
    lines: ["Core skills.", "Professional tools.", "Your start in CG."],
  },
  {
    title: "Practice",
    hint: "Real projects",
    icon: "person",
    lines: ["Live briefs.", "Mentor feedback.", "Community challenges."],
  },
  {
    title: "Result",
    hint: "A new career",
    icon: "target",
    lines: ["A portfolio that sells.", "Your first showreel.", "Studio-ready skills."],
  },
];

export default {
  name: "AboutReveal",
  components: {
    SceneLights,
    SideLabels,
    SiteNav,
    // Three.js тяжёлый — отдельный чанк, грузится только перед показом слайда.
    PhoneModel: defineAsyncComponent(() => import("./PhoneModel.vue")),
  },
  props: {
    eyebrow: { type: String, default: "About the school" },
    title: { type: String, default: "BigDesign is more than a school." },
    subtitle: {
      type: String,
      default: "A platform for the growth of CG artists, motion designers and creative people.",
    },
    lead: {
      type: String,
      default: "Learning. Community. Practice. Everything you need for creative growth in one place.",
    },
    focusEyebrow: { type: String, default: "Interactive device" },
    focusTitle: { type: String, default: "Press the keys on the device." },
    focusLead: { type: String, default: "Each glowing key opens one step of the path." },
    backLabel: { type: String, default: "Back" },
    steps: { type: Array, default: () => STEPS },
    sideItems: { type: Array, default: () => ["CG", "Motion", "VFX", "Creative careers"] },
    fallbackSrc: { type: String, default: "/description_video/web/16_08_1080.mp4" },
    phoneFill: { type: Number, default: 0.92 }, // доля высоты места под устройство
    focusMs: { type: Number, default: 1100 }, // выезд устройства в центр и обратно
    // Что показывает экран устройства перед нырком в галерею.
    diveScreen: {
      type: Object,
      default: () => ({ index: -1, total: 0, label: "NEXT", title: "STUDENT WORKS", lines: ["Made by our students."] }),
    },
    stagger: { type: Number, default: 110 },
    autoMs: { type: Number, default: 6000 }, // сам листает шаги, пока их не трогали
  },
  data() {
    return {
      prepared: false,
      live: false,
      revealed: false, // анимация появления отыграла — устройство видно и откликается
      focused: false,
      diving: false,   // нырок в экран: устройство замирает, на экране — diveScreen
      diveOn: false,   // показана плоская копия экрана, которая раздувается на весь вид
      activeStep: 0,
      phoneMode: "loading",
      anims: [],
      autoTimer: null,
    };
  },
  computed: {
    phoneScreen() {
      if (this.diving) return this.diveScreen;
      const step = this.steps[this.activeStep];
      return {
        index: this.activeStep,
        total: this.steps.length,
        title: step.title.toUpperCase(),
        lines: step.lines,
      };
    },
    stepIcons() {
      return this.steps.map((step) => step.icon);
    },
    activeStepText() {
      const step = this.steps[this.activeStep];
      return this.focused ? `${step.title}. ${step.lines.join(" ")}` : "";
    },
  },
  unmounted() {
    this.stopAuto();
    window.removeEventListener("keydown", this.onKey);
    this.anims.forEach((a) => a.cancel());
  },
  methods: {
    // Создать 3D-сцену заранее, пока слайд ещё за экраном. Повторный вызов ничего не делает.
    prepare() {
      this.prepared = true;
    },

    // slideMs — длительность въезда слайда (передаёт App.vue).
    enter(slideMs) {
      this.prepare();
      this.live = true;
      this.startAuto();
      window.addEventListener("keydown", this.onKey);

      this.anims.forEach((a) => a.cancel());
      const easing = "cubic-bezier(.2,.7,.2,1)";
      // Устройство в DOM первое (лежит под текстом), а появляется последним — после текста.
      const items = [...this.$refs.panel.querySelectorAll(".reveal:not(.device)"), this.$refs.device];
      const anims = items.map((el, n) =>
        el.animate(
          [
            { opacity: 0, transform: "translateY(32px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          // fill: both — до своей задержки элемент уже скрыт и не мигает
          { duration: 800, delay: slideMs * 0.45 + n * this.stagger, easing, fill: "both" }
        )
      );
      this.anims = anims;
      // Отыграли — снимаем: итог совпадает с обычными стилями, а fill: both
      // держал бы полтора десятка лишних слоёв всё время, пока открыт экран.
      Promise.all(anims.map((a) => a.finished)).then(
        () => {
          anims.forEach((a) => a.cancel());
          this.revealed = this.live; // со слайда могли уйти, пока он проявлялся
        },
        () => {} // отказ = наш же cancel при повторном входе, снимать нечего
      );
    },

    leave() {
      this.resetDive();
      this.live = false;
      this.revealed = false;
      this.focused = false;
      this.stopAuto();
      window.removeEventListener("keydown", this.onKey);
    },

    // Внутренний шаг слайда для колеса / свайпа (вызывает App.vue): вниз — устройство в центр,
    // вверх — обратно. Возвращает длительность анимации или 0, если шаг не наш — тогда App листает слайды.
    // Пока слайд проявляется, устройство не трогаем: оно ещё прозрачное, а текст не дочитан.
    scrollStep(dir) {
      const wantFocus = dir > 0;
      if (this.phoneMode !== "3d") return 0;
      // Слайд ещё проявляется — шаг вниз придерживаем: иначе быстрая прокрутка проскочит телефон.
      if (!this.revealed) return wantFocus ? HOLD_MS : 0;
      if (wantFocus === this.focused) return 0;
      this.setFocus(wantFocus);
      return this.focusMs;
    },

    // Нырять в экран можно, только когда устройство в центре и это 3D (у запасного видео экрана нет).
    canDive() {
      return this.focused && this.phoneMode === "3d" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    },

    // Нырок в экран (вызывает App.vue при шаге вниз с устройством в центре). На экране — diveScreen,
    // устройство замирает анфас; затем плоская копия экрана раздувается на весь вид, корпус летит
    // на зрителя и растворяется, всё гаснет. Промис выполняется, когда наступила темнота.
    // Копия, а не зум 3D-сцены: холст на весь экран стоил ~20 мс кадра, а один слой CSS — почти ничего.
    async dive(ms) {
      this.diving = true;
      await new Promise((resolve) => setTimeout(resolve, DIVE_PREP_MS)); // мигание экрана + замирание
      const { panel, device, dive, diveCanvas, veil } = this.$refs;
      const snap = this.$refs.phone?.screenSnapshot();
      const area = panel.getBoundingClientRect();
      const opts = { duration: ms, easing: "cubic-bezier(.55,0,.75,.25)", fill: "forwards" }; // разгон — влетаем
      const fadeUi = [...panel.querySelectorAll(".site-nav, .labels, .focus-ui")].map((el) =>
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms * 0.4, fill: "forwards" })
      );
      const darken = veil.animate([{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], opts);
      this._diveAnims = [...fadeUi, darken];

      if (snap) {
        // Копия экрана — ровно поверх настоящего.
        const r = { ...snap.rect, left: snap.rect.left - area.left, top: snap.rect.top - area.top };
        const { sx, sy, sw, sh } = snap.crop;
        diveCanvas.width = sw;
        diveCanvas.height = sh;
        diveCanvas.getContext("2d").drawImage(snap.image, sx, sy, sw, sh, 0, 0, sw, sh);
        Object.assign(dive.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
        this.diveOn = true;
        // Центр экрана — в центр вида, масштаб — чтобы закрыть вид с запасом. Корпус летит так же.
        const scale = Math.max(area.width / r.width, area.height / r.height) * 1.1;
        const dx = area.width / 2 - (r.left + r.width / 2);
        const dy = area.height / 2 - (r.top + r.height / 2);
        const zoom = `translate(${dx}px, ${dy}px) scale(${scale})`;
        device.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
        this._diveAnims.push(
          // Копия проявляется поверх настоящего экрана коротко (8%): стык не «щёлкает»,
          // а двоение текста на полупрозрачной копии не успевает стать заметным.
          dive.animate([{ transform: "none", opacity: 0 }, { opacity: 1, offset: 0.08 }, { transform: zoom, opacity: 1 }], opts),
          device.animate([{ transform: "none", opacity: 1 }, { opacity: 1, offset: 0.4 }, { transform: zoom, opacity: 0 }], opts)
        );
      }
      await darken.finished.catch(() => {});
    },

    // Слайд уже скрыт (App.vue) — снимаем следы нырка, чтобы при возврате всё было как прежде.
    resetDive() {
      (this._diveAnims || []).forEach((a) => a.cancel());
      this._diveAnims = null;
      this.diveOn = false;
      this.diving = false;
      this.$refs.device.style.transformOrigin = "";
    },

    setFocus(on) {
      if (on === this.focused) return;
      // Фокус клавиатуры в панели, которая сейчас станет inert, — переносим его в ту, что появится.
      const hadFocus = this.$refs.panel.contains(document.activeElement);
      this.focused = on;
      if (on) this.stopAuto(); // дальше шаги переключают клавишами
      if (hadFocus) {
        this.$nextTick(() => {
          const target = on ? this.$refs.back : this.$refs.stepButtons?.[this.activeStep];
          target?.focus({ preventScroll: true });
        });
      }
    },

    // Клик по слою устройства. type: "key" (index — номер шага), "body" — корпус, "none" — мимо.
    onPick({ type, index }) {
      if (!this.revealed) return;
      if (!this.focused) {
        if (type !== "none") this.setFocus(true);
      } else if (type === "key") {
        this.select(index);
      } else if (type === "none") {
        this.setFocus(false);
      }
    },

    select(index) {
      this.activeStep = index;
      this.stopAuto(); // выбрали руками — больше не листаем сами
    },

    onKey(e) {
      const last = this.steps.length - 1;
      if (e.key === "ArrowRight") this.select(this.activeStep === last ? 0 : this.activeStep + 1);
      if (e.key === "ArrowLeft") this.select(this.activeStep === 0 ? last : this.activeStep - 1);
      if (e.key === "Escape") this.setFocus(false);
    },

    startAuto() {
      this.stopAuto();
      this.autoTimer = setInterval(() => {
        this.activeStep = (this.activeStep + 1) % this.steps.length;
      }, this.autoMs);
    },
    stopAuto() {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    },
  },
};
</script>

<style scoped>
.about {
  --horizon: 70%;        /* линия пола — её использует SceneLights */
  --accent: #4d7dff;
  --focus-ease: cubic-bezier(0.65, 0, 0.2, 1);

  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #fff;
  background: radial-gradient(110% 75% at 60% 40%, #0c0c0d 0%, #050505 50%, #000 100%);
  font-family: "Inter", system-ui, sans-serif;
}

/* Устройство. Где оно стоит, задают переменные «left top width height» в долях экрана:
   PhoneModel читает их сам, так раскладка остаётся здесь, вместе с медиазапросами.
   rest — справа, ближе к центру (чтобы не было пустоты посередине), focus — по центру. */
.device {
  --phone-rest: 47% 6% 52% 86%;
  --phone-focus: 25% 6% 50% 90%;

  position: absolute;
  inset: 0;
}

/* Чёрный фон запасного видео убирает режим screen. Он должен стоять на самом слое:
   .device анимируется (opacity/transform) и изолирует смешивание от фона под ним. */
.device.is-video {
  mix-blend-mode: screen;
  pointer-events: none;
}

.labels {
  top: 30%;
}

/* Текст и подсказка фокуса меняются местами: один уезжает влево и гаснет, другой проявляется.
   Задержка у того, кто появляется, — чтобы они не накладывались. */
.copy,
.focus-ui {
  position: absolute;
  top: 50%;
  left: clamp(24px, 6vw, 130px);
  translate: 0 -50%;
  transition:
    opacity calc(var(--focus-ms) * 0.5) ease calc(var(--focus-ms) * 0.35),
    transform var(--focus-ms) var(--focus-ease) calc(var(--focus-ms) * 0.2);
}

.copy {
  width: min(44%, 640px);
}

.is-focused .copy,
.focus-ui {
  opacity: 0;
  transform: translateX(-48px);
  pointer-events: none;
  transition-delay: 0s;
}

.focus-ui {
  width: min(24%, 340px);
}

.is-focused .focus-ui {
  opacity: 1;
  transform: none;
  pointer-events: auto;
  transition-delay: calc(var(--focus-ms) * 0.35), calc(var(--focus-ms) * 0.2);
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 clamp(16px, 1.6vw, 28px);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.eyebrow::before {
  content: "";
  width: 26px;
  height: 1px;
  background: currentColor;
}

.title,
.focus-title {
  margin: 0;
  font-family: "Jura", system-ui, sans-serif;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.title {
  font-size: clamp(30px, 2.7vw, 52px);
}

.focus-title {
  font-size: clamp(24px, 1.9vw, 36px);
}

.sub {
  margin: clamp(14px, 1.3vw, 22px) 0 0;
  max-width: 34ch;
  font-size: clamp(16px, 1.1vw, 21px);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.72);
  text-wrap: pretty;
}

.lead {
  margin: clamp(14px, 1.2vw, 20px) 0 0;
  max-width: 44ch;
  font-size: clamp(14px, 0.9vw, 17px);
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
  text-wrap: pretty;
}

/* Шаги курса: активный в рамке, остальные тихие.
   Отрицательный отступ слева — чтобы первый шаг встал по краю заголовка, а не по краю своей кнопки. */
.steps {
  display: flex;
  gap: clamp(8px, 1vw, 18px);
  margin: clamp(28px, 3vw, 56px) 0 0 calc(-1 * clamp(12px, 1.2vw, 22px));
  padding: 0;
  list-style: none;
}

.steps button {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: clamp(12px, 1vw, 18px) clamp(12px, 1.2vw, 22px);
  border: 1px solid transparent;
  border-radius: 12px;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
}

.steps li + li button {
  border-left-color: rgba(255, 255, 255, 0.14);
}

.steps button:hover .name {
  color: #fff;
}

.steps button.is-active {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.04);
}

.num {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
}

.is-active .num {
  color: var(--accent);
}

.name {
  font-size: clamp(15px, 1.15vw, 20px);
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.25s;
}

.is-active .name {
  color: #fff;
}

.hint {
  font-size: clamp(11px, 0.72vw, 13px);
  color: rgba(255, 255, 255, 0.4);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: clamp(24px, 2.4vw, 40px);
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: none;
  color: #fff;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
}

.back:hover {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.06);
}

/* Нырок в экран: копия экрана над всем слайдом, выше неё — затемнение. Позицию и полёт задаёт dive(). */
.dive {
  position: absolute;
  z-index: 4;
  overflow: hidden;
  border-radius: 10px; /* как у стекла экрана; растёт вместе с копией */
  pointer-events: none;
}

.dive canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.dive-veil {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: #000;
  opacity: 0;
  pointer-events: none;
}

/* Текст только для скринридера: в потоке документа, но не на экране. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Узкий вертикальный экран: текст сверху, устройство снизу. */
@media (max-width: 900px) and (orientation: portrait) {
  .about {
    --horizon: 62%;
  }
  .device {
    --phone-rest: 0% 52% 100% 46%;
    --phone-focus: 0% 30% 100% 68%;
  }
  .copy,
  .focus-ui {
    top: 16%;
    left: clamp(20px, 6vw, 40px);
    width: calc(100% - clamp(40px, 12vw, 80px));
    translate: none;
  }
  .focus-ui {
    top: 13%;
  }
  .steps {
    gap: 6px;
  }
  .steps button {
    padding: 10px;
  }
  .hint {
    display: none;
  }
  .back {
    margin-top: 16px;
  }
}

/* Телефон боком (низкий альбомный экран): раскладка как на десктопе, но текст плотнее,
   а всё содержимое — ниже шапки: по высоте места почти нет. */
@media (orientation: landscape) and (max-height: 500px) {
  .device {
    --phone-rest: 47% 17% 52% 81%;
    --phone-focus: 25% 17% 50% 81%;
  }
  .copy,
  .focus-ui {
    top: calc(50% + 36px); /* середина места под шапкой */
  }
  .focus-ui {
    width: 30%;
  }
  .copy .lead,
  .hint {
    display: none;
  }
  .eyebrow {
    margin-bottom: 10px;
  }
  .title {
    font-size: 26px;
  }
  .sub {
    margin-top: 10px;
    font-size: 15px;
  }
  .steps {
    margin-top: 16px;
  }
  .steps button {
    padding: 8px 10px;
  }
  .back {
    margin-top: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .copy,
  .focus-ui {
    transition: none;
  }
}
</style>
