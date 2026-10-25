<template>
  <!--
    Первый экран нового дизайна.
    В центре — одна вертикальная "лента" из работ учеников,
    которая безостановочно уезжает снизу вверх.
  -->
  <section class="hero">
    <div
      ref="frame"
      class="frame"
      :style="{ '--cell-h': cellHeight + 'px' }"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <!--
        В ленте список работ идёт ДВА раза подряд.
        Когда лента уезжает ровно на свою половину (-50%),
        картинка совпадает с началом — и анимация повторяется без стыка.
      -->
      <div
        class="track"
        :class="{ 'is-paused': hovered && pauseOnHover }"
        :style="{ animationDuration: durationSec + 's' }"
      >
        <div
          v-for="(item, i) in loopItems"
          :key="i + '-' + item.slug"
          class="cell"
        >
          <img
            v-if="item.poster"
            :src="item.poster"
            class="cell-media cell-poster"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <video
            :data-src="item.video"
            class="cell-media cell-video"
            muted
            loop
            playsinline
            preload="none"
            disablepictureinpicture
          ></video>
        </div>
      </div>

      <div v-if="overlayTitle" class="overlay-title">
        <span v-for="(line, i) in overlayTitle.split('\n')" :key="i">{{ line }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import { works } from "../../data/works.js";

export default {
  name: "WorksMarquee",
  props: {
    // Сколько работ помещается в кадр по высоте (можно дробное: 2.5 = две с половиной).
    visibleCount: { type: Number, default: 2.5 },
    // Скорость ленты в пикселях в секунду. Больше число — быстрее летит.
    speed: { type: Number, default: 380 },
    // Останавливать ленту при наведении мышкой.
    pauseOnHover: { type: Boolean, default: true },
    // Надпись поверх ленты. \n — перенос строки. Передай "" чтобы убрать.
    overlayTitle: { type: String, default: "big\ndesign" },
  },
  data() {
    return {
      items: works,
      hovered: false,
      durationSec: 20,
      frameHeight: 0,
      cellHeight: 0,
      io: null,
      ro: null,
    };
  },
  computed: {
    // Тот же список два раза — для бесшовной петли.
    loopItems() {
      return [...this.items, ...this.items];
    },
  },
  methods: {
    // Пересчитываем длительность анимации так, чтобы скорость всегда была
    // одинаковой (px/сек), независимо от размера экрана.
    recalcDuration() {
      const frame = this.$refs.frame;
      if (!frame) return;
      this.frameHeight = frame.clientHeight;
      // Высота одной ячейки = высота кадра, делённая на кол-во видимых работ.
      this.cellHeight = this.frameHeight / this.visibleCount;
      const distance = this.cellHeight * this.items.length; // путь за один полный цикл
      this.durationSec = Math.max(1, distance / this.speed);
    },

    // Видео тяжёлые, поэтому качаем и запускаем только те, что рядом с кадром.
    setupVisibilityWatcher() {
      const frame = this.$refs.frame;
      if (!frame) return;

      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (!video.src) video.src = video.dataset.src;
              const p = video.play();
              if (p) p.catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { root: frame, rootMargin: "150px 0px", threshold: 0 }
      );

      frame.querySelectorAll(".cell-video").forEach((v) => this.io.observe(v));
    },
  },
  mounted() {
    this.recalcDuration();
    this.setupVisibilityWatcher();

    this.ro = new ResizeObserver(() => this.recalcDuration());
    this.ro.observe(this.$refs.frame);
  },
  unmounted() {
    if (this.io) this.io.disconnect();
    if (this.ro) this.ro.disconnect();
  },
};
</script>

<style scoped>
.hero {
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 24px;
}

/* Окно, в котором видно ленту. Всё, что выходит за него — обрезается. */
.frame {
  position: relative;
  width: min(340px, 76vw);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #0a0a0a;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
}

.track {
  display: flex;
  flex-direction: column;
  will-change: transform;
  animation-name: scroll-up;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.track.is-paused {
  animation-play-state: paused;
}

/* -50% = ровно первая половина ленты (один полный список работ). */
@keyframes scroll-up {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(0, -50%, 0); }
}

.cell {
  position: relative;
  flex: 0 0 auto;
  height: var(--cell-h);
  overflow: hidden;
}

.cell-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Постер лежит под видео: пока видео не загрузилось — видно картинку. */
.cell-poster { z-index: 1; }
.cell-video  { z-index: 2; background: transparent; }

.overlay-title {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: #fff;
  mix-blend-mode: difference;
  font-family: "Libertinus Mono", monospace;
  font-size: clamp(26px, 7vw, 42px);
  line-height: 0.95;
  letter-spacing: -0.02em;
}

@media (max-width: 600px) {
  .frame { width: 82vw; }
}
</style>
