<template>
  <!--
    Четвёртый экран: видео-отзывы учеников — лента портретов в глубину, как зал галереи.
    Центральный отзыв тихо играет без звука; клик по нему — смотреть со звуком с начала,
    клик по соседнему — выдвинуть его в центр. ← → и свайп листают, Esc — снова без звука.
    Появление запускает App.vue: enter()/leave() при смене слайда.
  -->
  <section ref="panel" class="reviews" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <SceneLights />
    <SiteNav class="reveal" current="#reviews" />

    <header class="head">
      <p class="eyebrow reveal">{{ eyebrow }}</p>
      <h2 class="title reveal">{{ title }}</h2>
      <p class="lead reveal">{{ lead }}</p>
    </header>

    <div class="stage reveal">
      <button
        v-for="(card, i) in cards"
        :key="card.slug"
        type="button"
        class="card"
        :class="[placeOf(card.d), { 'is-jump': card.jump }]"
        :style="{ '--d': card.d, '--ad': Math.abs(card.d) }"
        :tabindex="Math.abs(card.d) <= 1 ? 0 : -1"
        :aria-label="i === active ? `${sound ? pauseLabel : watchLabel}: ${card.name}` : card.name"
        @click="onCard(i)"
      >
        <span class="card-media">
          <img :src="card.posterWeb" alt="" decoding="async" />
          <!-- Видео только у центрального и только когда слайд проявился: остальные — постеры. -->
          <video
            v-if="i === active && revealed"
            :ref="setVideo"
            class="card-video"
            :src="card.video"
            :muted="!sound"
            :loop="!sound"
            autoplay
            playsinline
            @playing="$event.target.classList.add('is-playing')"
            @timeupdate="onTime"
            @ended="setSound(false)"
          ></video>
          <span v-if="i === active && (!sound || paused)" class="pill" aria-hidden="true">
            <span class="pill-icon">▶</span>{{ sound ? resumeLabel : watchLabel }}
          </span>
          <span v-if="i === active && sound" class="progress" aria-hidden="true">
            <i :style="{ transform: `scaleX(${progress})` }"></i>
          </span>
        </span>
      </button>
    </div>

    <p class="caption reveal">
      <span class="name">{{ reviews[active].name }}</span>
      <span class="count">0{{ active + 1 }} / 0{{ reviews.length }}</span>
    </p>
  </section>
</template>

<script>
import SceneLights from "./SceneLights.vue";
import SiteNav from "./SiteNav.vue";
import { reviews as REVIEWS } from "../../data/reviews.js";

const SWIPE_PX = 50;

export default {
  name: "StudentReviews",
  components: { SceneLights, SiteNav },
  props: {
    reviews: { type: Array, default: () => REVIEWS },
    eyebrow: { type: String, default: "Reviews" },
    title: { type: String, default: "In their own words." },
    lead: { type: String, default: "Our students on what changed for them." },
    watchLabel: { type: String, default: "Watch with sound" },
    resumeLabel: { type: String, default: "Resume" },
    pauseLabel: { type: String, default: "Pause" },
    stagger: { type: Number, default: 110 },
  },
  data() {
    return {
      live: false,
      revealed: false,
      active: 0,
      prevActive: 0, // нужен, чтобы заметить «перескок» карточки через край ленты
      sound: false,  // центральный играет со звуком (иначе — тихий повтор)
      paused: false,
      progress: 0,
    };
  },
  computed: {
    // d — место карточки относительно центра: 0 — центр, ±1 — соседи, ±2 — дальние, 3 — скрыта.
    // Лента по кругу, поэтому место считаем по кратчайшему пути.
    cards() {
      const n = this.reviews.length;
      const place = (k) => {
        const m = ((k % n) + n) % n;
        return m > n / 2 ? m - n : m;
      };
      return this.reviews.map((review, i) => {
        const d = place(i - this.active);
        // Карточка перепрыгнула с одного края ленты на другой — двигать её через весь экран не нужно.
        const jump = Math.abs(d - place(i - this.prevActive)) > 2;
        return { ...review, d, jump };
      });
    },
  },
  created() {
    this._anims = [];
    this._video = null;
    this._touch = null;
  },
  unmounted() {
    window.removeEventListener("keydown", this.onKey);
    this._anims.forEach((a) => a.cancel());
  },
  methods: {
    // slideMs — длительность въезда слайда (передаёт App.vue).
    enter(slideMs) {
      this.live = true;
      window.addEventListener("keydown", this.onKey);
      this._anims.forEach((a) => a.cancel());
      const anims = [...this.$refs.panel.querySelectorAll(".reveal")].map((el, n) =>
        el.animate(
          [
            { opacity: 0, transform: "translateY(32px)" },
            { opacity: 1, transform: "none" },
          ],
          // fill: both — до своей задержки элемент уже скрыт и не мигает
          { duration: 800, delay: slideMs * 0.45 + n * this.stagger, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" }
        )
      );
      this._anims = anims;
      // Отыграли — снимаем анимации и только теперь запускаем видео: старт посреди въезда даёт рывок.
      Promise.all(anims.map((a) => a.finished)).then(
        () => {
          anims.forEach((a) => a.cancel());
          this.revealed = this.live; // со слайда могли уйти, пока он проявлялся
        },
        () => {} // отказ = наш же cancel при повторном входе
      );
    },

    leave() {
      this.stopVideo();
      this.live = false;
      this.revealed = false;
      this.setSound(false);
      window.removeEventListener("keydown", this.onKey);
    },

    placeOf(d) {
      if (d === 0) return "is-center";
      if (Math.abs(d) === 1) return "is-near";
      return Math.abs(d) === 2 ? "is-side" : "is-far";
    },

    onCard(i) {
      if (i === this.active) this.toggleSound();
      else this.select(i);
    },

    select(i) {
      const n = this.reviews.length;
      const next = ((i % n) + n) % n;
      if (next === this.active) return;
      this.stopVideo(); // иначе убранное видео докачивается в фоне
      this.prevActive = this.active;
      this.active = next;
      this.setSound(false);
    },

    // Вызывается прямо из клика: play() со звуком в обработчике жеста Safari не блокирует.
    toggleSound() {
      const video = this._video;
      if (!video) return;
      if (!this.sound) {
        this.setSound(true);
        video.muted = false;
        video.loop = false;
        video.currentTime = 0;
        video.play().catch(() => {
          // Со звуком запускать не разрешили — остаёмся в тихом повторе.
          this.setSound(false);
          video.muted = true;
          video.play().catch(() => {});
        });
      } else if (this.paused) {
        this.paused = false;
        video.play().catch(() => {});
      } else {
        this.paused = true;
        video.pause();
      }
    },

    // Со звуком → обратно в тихий повтор (или сброс при смене отзыва).
    setSound(on) {
      this.sound = on;
      this.paused = false;
      this.progress = 0;
      if (!on && this._video) {
        this._video.muted = true;
        this._video.loop = true;
        this._video.play().catch(() => {});
      }
    },

    stopVideo() {
      const video = this._video;
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
    },

    setVideo(el) {
      this._video = el;
    },

    onTime(e) {
      if (this.sound) this.progress = e.target.currentTime / (e.target.duration || 1);
    },

    onKey(e) {
      if (e.key === "ArrowRight") this.select(this.active + 1);
      if (e.key === "ArrowLeft") this.select(this.active - 1);
      if (e.key === "Escape" && this.sound) this.setSound(false);
    },

    // Горизонтальный свайп листает отзывы; вертикальный остаётся за App (смена слайдов).
    onTouchStart(e) {
      this._touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd(e) {
      if (!this._touch) return;
      const dx = e.changedTouches[0].clientX - this._touch.x;
      const dy = e.changedTouches[0].clientY - this._touch.y;
      this._touch = null;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) this.select(this.active - Math.sign(dx));
    },
  },
};
</script>

<style scoped>
.reviews {
  --horizon: 74%; /* линия пола — её использует SceneLights */
  --accent: #4d7dff;
  --card-h: 58vh;
  --gap: 40vh;    /* шаг ленты до перспективы; в vh — чтобы раскладка не зависела от пропорций экрана */

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

.lead {
  max-width: 34ch;
  margin: clamp(10px, 1vw, 16px) 0 0;
  font-size: clamp(14px, 0.9vw, 17px);
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
}

/* Лента: перспектива в vh — тот же коэффициент глубины на любом экране. Без preserve-3d:
   иначе сама лента стала бы плоскостью на z = 0 и забирала клики у карточек, стоящих глубже.
   Кто кого перекрывает — решает z-index по удалённости от центра. */
.stage {
  position: absolute;
  inset: 0;
  perspective: 125vh;
}

/* Карточка встаёт на своё место по --d (смещение от центра) и --ad (|d|, глубина и затемнение).
   Смена отзыва — просто новые --d: двигает CSS-переход. */
.card {
  position: absolute;
  left: 50%;
  top: 55%;
  height: var(--card-h);
  aspect-ratio: 9 / 16;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  z-index: calc(10 - var(--ad));
  transform: translate(-50%, -50%) translateX(calc(var(--d) * var(--gap)))
    translateZ(calc(var(--ad) * -260px)) rotateY(calc(var(--d) * -6deg));
  transition:
    transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 0.6s ease;
}

.card.is-far {
  opacity: 0;
  visibility: hidden;
  transition:
    transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 0.4s ease,
    visibility 0s 0.4s;
}

.card.is-jump {
  transition: none;
}

.card-media {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 14px;
  background: #0a0a0b;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

/* Дальние темнее — как будто туда меньше доходит свет. */
.card-media::after {
  content: "";
  position: absolute;
  inset: 0;
  background: #000;
  opacity: calc(var(--ad) * 0.3);
  transition: opacity 0.6s;
  pointer-events: none;
}

.card.is-near:hover .card-media::after,
.card.is-near:focus-visible .card-media::after {
  opacity: 0.12;
}

.card:focus-visible .card-media {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
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
  transition: opacity 0.5s;
}

.card-video.is-playing {
  opacity: 1;
}

/* Подсказка на центральном: «смотреть со звуком». */
.pill {
  position: absolute;
  left: 50%;
  bottom: 18px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  white-space: nowrap;
  translate: -50% 0;
  transition: border-color 0.25s, background 0.25s;
}

.pill-icon {
  font-size: 10px;
}

.card.is-center:hover .pill {
  border-color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.6);
}

.progress {
  position: absolute;
  inset: auto 0 0;
  z-index: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
}

.progress i {
  display: block;
  height: 100%;
  background: #fff;
  transform-origin: left;
  transition: transform 0.25s linear;
}

.caption {
  position: absolute;
  left: 50%;
  top: calc(55% + var(--card-h) / 2 + 22px);
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0;
  translate: -50% 0;
  white-space: nowrap;
  pointer-events: none;
}

.name {
  font-family: "Jura", system-ui, sans-serif;
  font-size: clamp(18px, 1.3vw, 24px);
}

.count {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
}

/* Узкий вертикальный экран: заголовок сверху, лента ниже, соседи выглядывают с краёв. */
@media (max-width: 900px) and (orientation: portrait) {
  .reviews {
    --card-h: 50vh;
  }
  .card {
    top: 57%;
  }
  .caption {
    top: calc(57% + var(--card-h) / 2 + 16px);
  }
}

/* Телефон боком: по высоте места нет — заголовок убираем, карточки крупнее. */
@media (orientation: landscape) and (max-height: 500px) {
  .reviews {
    --card-h: 64vh;
    --gap: 44vh;
  }
  .head {
    display: none;
  }
  .card {
    top: 50%;
  }
  .caption {
    top: calc(50% + var(--card-h) / 2 + 10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .card-media::after,
  .card-video {
    transition: none;
  }
}
</style>
