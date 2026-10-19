<template>
  <!--
    Третий экран: работы учеников — «зал в глубине». Работы разбиты на волны по 5–6 штук:
    шаг колеса вниз проносит текущую волну мимо камеры, а следующая выходит из темноты.
    Клик по карточке — работа вырастает почти на весь экран; Esc, клик мимо или колесо — обратно.
    Появление запускает App.vue: enter()/leave() при смене слайда, scrollStep() — шаги колеса.
  -->
  <section
    ref="panel"
    class="gallery"
    :class="{ 'is-viewing': openIndex !== null }"
    @pointermove="onPointer"
  >
    <SceneLights />
    <SiteNav class="reveal" />

    <header class="head">
      <p class="eyebrow reveal">{{ eyebrow }}</p>
      <h2 class="title reveal">{{ title }}</h2>
    </header>

    <div class="stage">
      <div ref="hall" class="hall">
        <button
          v-for="(card, i) in cards"
          :key="card.work.slug"
          :ref="(el) => setCardEl(el, i)"
          type="button"
          class="card"
          :class="[
            `slot-${card.slot}`,
            card.work.orientation === 'v' ? 'is-v' : 'is-h',
            { 'is-on': card.wave === wave || card.wave === leavingWave, 'is-lifted': openIndex === i },
          ]"
          :tabindex="card.wave === wave ? 0 : -1"
          :aria-hidden="card.wave !== wave"
          :aria-label="`${openLabel}: ${card.work.name || workLabel}`"
          @click="open(i)"
          @pointerenter="hovered = i"
          @pointerleave="hovered = null"
          @focus="hovered = i"
          @blur="hovered = null"
        >
          <span class="card-body">
            <span class="card-media">
              <img :src="card.work.previewPoster" alt="" decoding="async" />
              <!-- Превью играет только у одной карточки за раз: видео тяжёлые. -->
              <video
                v-if="playing === i"
                class="card-video"
                :src="card.work.previewVideo"
                muted
                loop
                playsinline
                autoplay
                @playing="$event.target.classList.add('is-playing')"
              ></video>
            </span>
            <span v-if="card.work.name" class="card-name">{{ card.work.name }}</span>
          </span>
        </button>
      </div>
    </div>

    <p class="meta reveal">
      <span>0{{ wave + 1 }} / 0{{ waves.length }}</span>
      <span class="meta-hint">{{ scrollHint }}</span>
    </p>

    <!-- Просмотр работы. Окно стоит на месте, а «вырастает» из карточки его трансформ (см. flip).
         v-show, а не v-if: видео должно существовать уже в момент клика (см. playViewer). -->
    <div
      v-show="openIndex !== null"
      class="viewer"
      role="dialog"
      aria-modal="true"
      :aria-label="viewerName"
      :style="{ '--ratio': openRatio }"
    >
      <div ref="backdrop" class="viewer-backdrop" @click="close"></div>
      <div ref="frame" class="viewer-frame">
        <video ref="viewerVideo" :muted="muted" loop playsinline preload="none"></video>
      </div>
      <div ref="bar" class="viewer-bar">
        <p class="viewer-name">
          {{ viewerName }}
          <span class="viewer-count">{{ String(openIndex + 1).padStart(2, "0") }} / {{ cards.length }}</span>
        </p>
        <div class="viewer-actions">
          <button type="button" class="pill" :aria-pressed="!muted" @click="muted = !muted">
            {{ muted ? soundOnLabel : soundOffLabel }}
          </button>
          <button type="button" class="pill round" :aria-label="prevLabel" @click="stepViewer(-1)">←</button>
          <button type="button" class="pill round" :aria-label="nextLabel" @click="stepViewer(1)">→</button>
          <button ref="closeBtn" type="button" class="pill round" :aria-label="closeLabel" @click="close">✕</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import SceneLights from "./SceneLights.vue";
import SiteNav from "./SiteNav.vue";
import { works as WORKS } from "../../data/works.js";

// Места карточек в волне — какую ориентацию место ждёт. Позиции и глубина — в стилях (.slot-N):
// s0 — главная по центру, s1/s2 — вертикальные по бокам, s3–s5 — дальние.
const SLOTS = ["h", "v", "v", "h", "v", "h"];
const EASE = "cubic-bezier(.65,0,.2,1)";
const EASE_OUT = "cubic-bezier(.2,.7,.2,1)";
const NEAR = "translateZ(700px)";  // мимо камеры
const FAR = "translateZ(-1800px)"; // из темноты

// Делим работы на волны поровну (16 → 6, 5, 5) и раскладываем по местам нужной ориентации.
// Не хватило вертикальных или горизонтальных — берём из другой стопки.
function buildWaves(list) {
  const pools = {
    v: list.filter((w) => w.orientation === "v"),
    h: list.filter((w) => w.orientation !== "v"),
  };
  const count = Math.ceil(list.length / SLOTS.length);
  const base = Math.floor(list.length / count);
  return Array.from({ length: count }, (_, n) => {
    const size = base + (n < list.length % count ? 1 : 0);
    return SLOTS.slice(0, size).map((want) => {
      const pool = pools[want].length ? pools[want] : pools[want === "v" ? "h" : "v"];
      return pool.shift();
    });
  });
}

export default {
  name: "WorksGallery",
  components: { SceneLights, SiteNav },
  props: {
    works: { type: Array, default: () => WORKS },
    eyebrow: { type: String, default: "Student works" },
    title: { type: String, default: "Made by our students." },
    scrollHint: { type: String, default: "Scroll to explore" },
    workLabel: { type: String, default: "Student work" }, // у работы нет имени автора
    openLabel: { type: String, default: "Open" },
    soundOnLabel: { type: String, default: "Sound on" },
    soundOffLabel: { type: String, default: "Sound off" },
    prevLabel: { type: String, default: "Previous work" },
    nextLabel: { type: String, default: "Next work" },
    closeLabel: { type: String, default: "Close" },
    waveMs: { type: Number, default: 1100 },   // смена волны
    viewerMs: { type: Number, default: 650 },  // карточка вырастает в окно и обратно
    stagger: { type: Number, default: 70 },
    tilt: { type: Number, default: 3 },        // поворот зала за мышью, градусы
  },
  data() {
    return {
      live: false,
      revealed: false,     // появление отыграло — можно листать и открывать
      wave: 0,
      leavingWave: null,   // волна, которая сейчас улетает (видна до конца анимации)
      hovered: null,
      openIndex: null,     // какая карточка открыта в просмотре
      openRatio: 16 / 9,   // настоящие пропорции открытой работы
      closing: false,
      muted: true,         // со звуком — только если попросили; выбор помним между работами
      anims: [],
    };
  },
  computed: {
    waves() {
      return buildWaves(this.works);
    },
    // Плоский список карточек: работа, её волна и место в волне.
    cards() {
      return this.waves.flatMap((list, wave) => list.map((work, slot) => ({ work, wave, slot })));
    },
    viewerName() {
      const work = this.openIndex === null ? null : this.cards[this.openIndex].work;
      return work?.name || this.workLabel;
    },
    // Какая карточка играет превью: наведённая, иначе главная в волне. Пока слайд въезжает
    // или волны едут — никакая: запуск видео посреди анимации даёт рывок кадра.
    playing() {
      if (!this.revealed || this.openIndex !== null || this.leavingWave !== null) return -1;
      if (this.hovered !== null) return this.hovered;
      return this.cards.findIndex((c) => c.wave === this.wave && c.slot === 0);
    },
  },
  created() {
    this._cardEls = [];
    this._tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    this._reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
  unmounted() {
    window.removeEventListener("keydown", this.onKey);
    cancelAnimationFrame(this._tiltRaf);
    this.anims.forEach((a) => a.cancel());
  },
  methods: {
    setCardEl(el, i) {
      this._cardEls[i] = el;
    },

    // slideMs — длительность въезда слайда (передаёт App.vue).
    enter(slideMs) {
      this.live = true;
      this.leavingWave = null; // прошлую смену волны, если она не доиграла, run() сейчас отменит
      window.addEventListener("keydown", this.onKey);

      const delay = slideMs * 0.45;
      const reveal = [...this.$refs.panel.querySelectorAll(".reveal")].map((el, n) =>
        el.animate(
          [
            { opacity: 0, transform: "translateY(32px)" },
            { opacity: 1, transform: "none" },
          ],
          // fill: both — до своей задержки элемент уже скрыт и не мигает
          { duration: this.ms(800), delay: delay + n * this.stagger, easing: EASE_OUT, fill: "both" }
        )
      );
      // Карточки текущей волны выходят из темноты.
      const cards = this.bodiesOf(this.wave).map((el, n) =>
        el.animate(
          [
            { transform: FAR, opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          { duration: this.ms(this.waveMs), delay: delay + 200 + n * this.stagger, easing: EASE_OUT, fill: "both" }
        )
      );
      this.run([...reveal, ...cards], () => (this.revealed = this.live)); // со слайда могли уйти
    },

    leave() {
      this.live = false;
      this.revealed = false;
      this.hovered = null;
      if (this.openIndex !== null) this.hideViewer(); // слайд уже за экраном — закрываем без анимации
      window.removeEventListener("keydown", this.onKey);
    },

    // Шаг колеса / свайпа (вызывает App.vue): закрыть просмотр или сменить волну.
    // Возвращает длительность анимации или 0, если шаг не наш — тогда App листает слайды.
    scrollStep(dir) {
      if (this.openIndex !== null) {
        this.close();
        return this.viewerMs;
      }
      const next = this.wave + dir;
      if (!this.revealed || next < 0 || next >= this.waves.length) return 0;
      this.showWave(next, dir);
      return this.waveMs;
    },

    // Камера как будто едет: вниз — вперёд (старая волна пролетает мимо, новая выходит из темноты),
    // вверх — назад (старая тает в глубине, прошлая возвращается из-за камеры).
    showWave(next, dir) {
      const leaving = this.bodiesOf(this.wave);
      const entering = this.bodiesOf(next);
      const [outTo, inFrom] = dir > 0 ? [NEAR, FAR] : [FAR, NEAR];
      this.leavingWave = this.wave;
      this.wave = next;
      this.hovered = null;

      // Уходящие улетают с разгоном, а гаснут сразу и быстро (отдельной анимацией: у них своя кривая) —
      // иначе огромная полупрозрачная карточка мутит новую волну. Новые стартуют чуть позже и тормозят на месте.
      const fly = { duration: this.ms(this.waveMs * 0.7), easing: "cubic-bezier(.5,0,.75,.3)", fill: "both" };
      const fade = { duration: this.ms(this.waveMs * 0.4), easing: "ease-out", fill: "both" };
      const inn = { duration: this.ms(this.waveMs * 0.9), easing: EASE_OUT, fill: "both" };
      this.run(
        [
          ...leaving.flatMap((el, n) => {
            const delay = this.ms(n * this.stagger * 0.5);
            return [
              el.animate([{ transform: "none" }, { transform: outTo }], { ...fly, delay }),
              el.animate([{ opacity: 1 }, { opacity: 0 }], { ...fade, delay }),
            ];
          }),
          ...entering.map((el, n) =>
            el.animate(
              [{ transform: inFrom, opacity: 0 }, { transform: "none", opacity: 1 }],
              { ...inn, delay: this.ms(this.waveMs * 0.2 + n * this.stagger) }
            )
          ),
        ],
        () => (this.leavingWave = null)
      );
    },

    // Запустить набор анимаций вместо прошлого. Когда отыграют — done(), и анимации снимаем:
    // итог совпадает с обычными стилями, а fill держал бы лишние слои всё время.
    async run(anims, done) {
      this.anims.forEach((a) => a.cancel());
      this.anims = anims;
      try {
        await Promise.all(anims.map((a) => a.finished));
      } catch {
        return; // отменили — уже идёт следующий шаг
      }
      done();
      await this.$nextTick(); // сначала улетевшие скрылись, потом снимаем анимацию — иначе мигнут
      anims.forEach((a) => a.cancel());
    },

    bodiesOf(wave) {
      return this.cards
        .map((card, i) => (card.wave === wave ? this._cardEls[i]?.querySelector(".card-body") : null))
        .filter(Boolean);
    },

    mediaOf(i) {
      return this._cardEls[i]?.querySelector(".card-media");
    },

    /* ---------- просмотр работы ---------- */

    open(i) {
      if (!this.revealed || this.leavingWave !== null || this.openIndex !== null) return;
      this._returnFocus = document.activeElement;
      this.setOpen(i);
      this.$nextTick(() => {
        // Раскрытие запоминаем: закрытие посреди него развернёт его назад, а не прыгнет.
        const anim = this.flip(this.mediaOf(i));
        this._openFlip = anim;
        anim.finished.then(() => {
          if (this._openFlip !== anim) return; // его уже забрало закрытие
          this._openFlip = null;
          anim.cancel(); // итог совпадает с обычными стилями — fill больше не нужен
        }, () => {});
        this.$refs.closeBtn.focus({ preventScroll: true });
      });
    },

    // Вызывается прямо из обработчика клика / клавиши — см. playViewer.
    setOpen(i) {
      this.openIndex = i;
      const { work } = this.cards[i];
      // Пропорции берём у постера: он уже загружен, а у видео они известны только после загрузки.
      const img = this._cardEls[i]?.querySelector("img");
      this.openRatio = img?.naturalWidth ? img.naturalWidth / img.naturalHeight : work.orientation === "v" ? 9 / 16 : 16 / 9;
      this.playViewer(work);
    },

    // Один <video> на все работы, управляем им вручную: смена src обрывает загрузку прошлой работы,
    // а play() прямо в обработчике жеста Safari не блокирует даже со звуком.
    playViewer(work) {
      const video = this.$refs.viewerVideo;
      video.poster = work.previewPoster;
      video.src = work.webVideo;
      video.muted = this.muted;
      video.play().catch(() => {
        // Со звуком запускать не разрешили — играем без звука.
        this.muted = true;
        video.muted = true;
        video.play().catch(() => {});
      });
    },

    // Соседняя работа прямо в просмотре (по кругу, в порядке волн). Пока окно раскрывается — ждём:
    // иначе посреди полёта сменятся пропорции и окно скакнёт.
    stepViewer(dir) {
      if (this.openIndex === null || this.closing || this._openFlip) return;
      this.setOpen((this.openIndex + dir + this.cards.length) % this.cards.length);
      this.$refs.frame.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: this.ms(300), easing: "ease" });
    },

    async close() {
      if (this.openIndex === null || this.closing) return;
      this.closing = true;
      const { backdrop, bar, frame } = this.$refs;
      const fade = { duration: this.ms(this.viewerMs * 0.8), easing: "ease", fill: "both" };
      // Гасим с текущей прозрачности: фон и панель могли ещё не успеть проявиться.
      const fadeOut = (el, opts) =>
        el.animate([{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], opts);
      this._closeAnims = [
        fadeOut(backdrop, fade),
        fadeOut(bar, { ...fade, duration: this.ms(200) }),
        this.flipBack(frame, fade),
      ];
      await Promise.all(this._closeAnims.map((a) => a.finished)).catch(() => {});
      if (!this.closing) return; // пока закрывали, слайд ушёл и leave() уже всё сбросил
      const focus = this._returnFocus;
      this.hideViewer();
      focus?.focus?.({ preventScroll: true });
    },

    // Окно возвращается в карточку. Если раскрытие ещё идёт — разворачиваем его (без скачка);
    // работа из другой волны (листали) своей карточки на экране не имеет — окно просто гаснет.
    flipBack(frame, fade) {
      const opening = this._openFlip;
      this._openFlip = null;
      if (opening?.playState === "running") {
        opening.reverse();
        return opening;
      }
      opening?.cancel();
      const card = this.cards[this.openIndex];
      if (card.wave === this.wave) return this.flip(this.mediaOf(this.openIndex), true);
      return frame.animate(
        [
          { opacity: 1, transformOrigin: "50% 50%" },
          { opacity: 0, transform: "scale(.94)", transformOrigin: "50% 50%" },
        ],
        fade
      );
    },

    // Спрятать просмотр сразу: остановить видео и оборвать его загрузку, снять анимации окна.
    hideViewer() {
      const video = this.$refs.viewerVideo;
      video.pause();
      video.removeAttribute("src");
      video.removeAttribute("poster");
      video.load(); // без этого тяжёлый ролик докачивается в фоне
      const anims = [...(this._closeAnims || []), this._openFlip].filter(Boolean);
      this._closeAnims = null;
      this._openFlip = null;
      this.openIndex = null;
      this.closing = false;
      // Снимаем после того, как окно скрылось (display: none) — иначе оно мигнёт в полный размер.
      this.$nextTick(() => anims.forEach((a) => a.cancel()));
    },

    // FLIP: окно уже стоит в итоговом месте; анимируем его трансформ от прямоугольника карточки
    // к нулю — двигается одна готовая картинка, без пересчёта раскладки на каждом кадре.
    flip(fromEl, back = false) {
      const { frame } = this.$refs;
      const a = fromEl.getBoundingClientRect();
      const b = frame.getBoundingClientRect();
      const from = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
      const frames = [{ transform: from }, { transform: "none" }];
      return frame.animate(back ? frames.reverse() : frames, {
        duration: this.ms(this.viewerMs),
        easing: EASE,
        fill: "both",
      });
    },

    onKey(e) {
      if (this.openIndex === null) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowRight") this.stepViewer(1);
      if (e.key === "ArrowLeft") this.stepViewer(-1);
    },

    /* ---------- зал поворачивается за мышью ---------- */

    onPointer(e) {
      if (this._reducedMotion || !this.live) return;
      const r = this.$refs.panel.getBoundingClientRect();
      this._tilt.tx = (e.clientX - r.left) / r.width - 0.5;
      this._tilt.ty = (e.clientY - r.top) / r.height - 0.5;
      if (!this._tiltRaf) this._tiltRaf = requestAnimationFrame(this.tiltStep);
    },

    // Плавно догоняем мышь; доехали — цикл останавливается до следующего движения.
    tiltStep() {
      const t = this._tilt;
      t.x += (t.tx - t.x) * 0.08;
      t.y += (t.ty - t.y) * 0.08;
      this.$refs.hall.style.transform = `rotateX(${(-t.y * this.tilt).toFixed(3)}deg) rotateY(${(t.x * this.tilt * 1.4).toFixed(3)}deg)`;
      const settled = Math.abs(t.tx - t.x) < 0.001 && Math.abs(t.ty - t.y) < 0.001;
      this._tiltRaf = settled ? 0 : requestAnimationFrame(this.tiltStep);
    },

    // Длительность или задержка с учётом prefers-reduced-motion: там всё переключается сразу.
    ms(value) {
      return this._reducedMotion ? 1 : value;
    },
  },
};
</script>

<style scoped>
.gallery {
  --horizon: 74%; /* линия пола — её использует SceneLights */
  --accent: #4d7dff;

  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #fff;
  background: radial-gradient(110% 75% at 50% 40%, #0c0c0d 0%, #050505 50%, #000 100%);
  font-family: "Inter", system-ui, sans-serif;
}

.head {
  position: absolute;
  top: clamp(92px, 13vh, 150px);
  left: clamp(24px, 6vw, 130px);
  z-index: 2;
  pointer-events: none;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 clamp(12px, 1.2vw, 20px);
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

.title {
  margin: 0;
  font-family: "Jura", system-ui, sans-serif;
  font-size: clamp(26px, 2.2vw, 42px);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

/* Зал: перспектива на сцене, карточки расставлены в глубину (translateZ). */
.stage {
  position: absolute;
  inset: 0;
  perspective: max(1000px, 125vh);
}

/* Сам зал — плоскость на z = 0 во весь экран: для мыши всё, что глубже, оказалось бы «за» ней.
   Поэтому клики ловят только карточки. */
.hall {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
}

/* Места в волне: --x/--y — центр карточки до перспективы, --z — глубина, --h — высота,
   --dim — затемнение дальних (туда меньше доходит свет). Перспектива стягивает глубокие
   карточки к центру в P / (P − z) раз, поэтому --x/--y дальних вынесены за край —
   на экране они встают в свободные места: справа сверху и под главной. */
.slot-0 { --x: 50%;   --y: 52%;   --z: 0px;     --h: 38vh; --dim: 0; }
.slot-1 { --x: 11.6%; --y: 58%;   --z: -220px;  --h: 50vh; --dim: 0.2; }
.slot-2 { --x: 88.4%; --y: 45.3%; --z: -220px;  --h: 50vh; --dim: 0.2; }
.slot-3 { --x: 81.7%; --y: -5%;   --z: -900px;  --h: 24vh; --dim: 0.5; }
.slot-4 { --x: 18.3%; --y: 108%;  --z: -900px;  --h: 30vh; --dim: 0.5; }
.slot-5 { --x: 73.6%; --y: 117%;  --z: -1100px; --h: 22vh; --dim: 0.55; }

.card {
  position: absolute;
  left: var(--x);
  top: var(--y);
  height: var(--h);
  aspect-ratio: 16 / 9;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%) translateZ(var(--z));
  transform-style: preserve-3d;
  visibility: hidden;
}

.card.is-v {
  aspect-ratio: 9 / 16;
}

.card.is-on {
  visibility: visible;
}

.card-body {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

/* Наведение — карточка чуть выходит вперёд и светлеет. Отдельный слой от card-body:
   у того свои анимации (смена волны), а transition и WAAPI на одном свойстве мешают друг другу. */
.card-media {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #0a0a0b;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.card-media::after {
  content: "";
  position: absolute;
  inset: 0;
  background: #000;
  opacity: var(--dim);
  transition: opacity 0.4s;
  pointer-events: none;
}

.card:hover .card-media,
.card:focus-visible .card-media {
  transform: translateZ(60px);
}

.card:hover .card-media::after,
.card:focus-visible .card-media::after {
  opacity: 0;
}

.card:focus-visible .card-media {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

/* Открытая работа «вышла» из карточки — на её месте пусто, пока идёт просмотр. */
.card.is-lifted .card-media {
  visibility: hidden;
}

.card-media img,
.card-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-video {
  opacity: 0;
  transition: opacity 0.4s;
}

.card-video.is-playing {
  opacity: 1;
}

.card-name {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.slot-0 .card-name,
.card:hover .card-name,
.card:focus-visible .card-name {
  opacity: 1;
}

.meta {
  position: absolute;
  left: clamp(24px, 6vw, 130px);
  bottom: clamp(24px, 5vh, 48px);
  z-index: 2;
  display: flex;
  gap: 18px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  pointer-events: none;
}

.meta-hint {
  color: rgba(255, 255, 255, 0.35);
}

/* ---------- просмотр работы ---------- */

.viewer {
  --frame-w: min(86vw, calc(74vh * var(--ratio)));

  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
}

.viewer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  animation: fade-in 0.5s ease both;
}

.viewer-frame {
  position: relative;
  width: var(--frame-w);
  aspect-ratio: var(--ratio);
  overflow: hidden;
  border-radius: 12px;
  background: #000;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.7);
  transform-origin: 0 0; /* FLIP считает сдвиг от левого верхнего угла */
}

.viewer-frame video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.viewer-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: var(--frame-w);
  min-width: min(520px, 92vw);
  animation: fade-in 0.4s ease 0.35s both;
}

.viewer-name {
  margin: 0;
  font-size: 15px;
}

.viewer-count {
  margin-left: 12px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
}

.viewer-actions {
  display: flex;
  gap: 8px;
}

.pill {
  min-width: 40px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: none;
  color: #fff;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
}

.pill.round {
  padding: 0;
}

.pill:hover,
.pill[aria-pressed="true"] {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.06);
}

@keyframes fade-in {
  from { opacity: 0; }
}

/* Узкий вертикальный экран: дальние — рядом маленьких превью под заголовком,
   главная по центру, вертикальные под ней. Расчёт тот же, через P / (P − z). */
@media (max-width: 900px) and (orientation: portrait) {
  .slot-0 { --x: 50%;  --y: 47%;  --h: 24vh; }
  .slot-1 { --x: 24%;  --y: 75%;  --h: 28vh; }
  .slot-2 { --x: 76%;  --y: 73%;  --h: 28vh; }
  .slot-3 { --x: -2%;  --y: 8.3%; --h: 17vh; }
  .slot-4 { --x: 50%;  --y: 8.3%; --h: 20vh; }
  .slot-5 { --x: 107%; --y: 4.1%; --h: 19vh; }

  .viewer {
    --frame-w: min(92vw, calc(70vh * var(--ratio)));
  }
  .viewer-bar {
    flex-wrap: wrap;
  }
}

/* Телефон боком: по высоте места нет — заголовок убираем, работы важнее (счётчик внизу остаётся). */
@media (orientation: landscape) and (max-height: 500px) {
  .head {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-media,
  .card-video {
    transition: none;
  }
}
</style>
