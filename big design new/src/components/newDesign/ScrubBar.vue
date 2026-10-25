<template>
  <!--
    Тонкая полоса перемотки ролика: клик — перейти, тянуть — перематывать, ←/→ с фокусом — ±5 с.
    Видео отдаёт родитель функцией getVideo (элемент меняется, а реактивным делать его незачем).
    Пока active — полоса сама следит за временем (rAF, без перерисовки компонента).
  -->
  <div
    ref="bar"
    class="scrub"
    :class="{ 'is-dragging': dragging }"
    role="slider"
    tabindex="0"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="Math.round(duration)"
    :aria-valuenow="Math.round(time)"
    :aria-valuetext="`${formatTime(time)} / ${formatTime(duration)}`"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown="onKey"
    @click.stop
  >
    <span class="track"><i ref="fill" class="fill"></i></span>
  </div>
</template>

<script>
import { formatTime, progressOf, timeAt } from "../../utils/media.js";

const KEY_STEP_S = 5;

export default {
  name: "ScrubBar",
  props: {
    getVideo: { type: Function, required: true },
    active: { type: Boolean, default: true },
    label: { type: String, default: "Seek" },
  },
  data() {
    // time/duration — только для aria (обновляются редко, см. tick); саму полосу двигает rAF.
    return { dragging: false, time: 0, duration: 0 };
  },
  watch: {
    active: "sync",
  },
  mounted() {
    this.sync();
  },
  unmounted() {
    cancelAnimationFrame(this._raf);
  },
  methods: {
    formatTime,

    sync() {
      cancelAnimationFrame(this._raf);
      this._raf = 0;
      if (this.active) this._raf = requestAnimationFrame(this.tick);
      else this.paint(0);
    },

    tick() {
      const video = this.getVideo();
      if (video && !this.dragging) {
        this.paint(progressOf(video.currentTime, video.duration));
        // aria — раз в секунду, не каждый кадр: это реактивные данные.
        if (Math.abs(video.currentTime - this.time) >= 1 || this.duration !== (video.duration || 0)) {
          this.time = video.currentTime;
          this.duration = video.duration || 0;
        }
      }
      this._raf = requestAnimationFrame(this.tick);
    },

    paint(share) {
      this.$refs.fill.style.transform = `scaleX(${share})`;
    },

    seek(clientX) {
      const video = this.getVideo();
      if (!video) return;
      const t = timeAt(clientX, this.$refs.bar.getBoundingClientRect(), video.duration);
      video.currentTime = t;
      this.time = t;
      this.paint(progressOf(t, video.duration));
    },

    onDown(e) {
      this.dragging = true;
      this.$refs.bar.setPointerCapture(e.pointerId); // тянем дальше, даже если палец ушёл с полосы
      this.seek(e.clientX);
    },
    onMove(e) {
      if (this.dragging) this.seek(e.clientX);
    },
    onUp() {
      this.dragging = false;
    },

    onKey(e) {
      const video = this.getVideo();
      if (!video || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      // Свои стрелки у слайдов (листать работы / отзывы) — пока фокус на полосе, они перематывают.
      e.preventDefault();
      e.stopPropagation();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      video.currentTime = Math.min(video.duration || 0, Math.max(0, video.currentTime + dir * KEY_STEP_S));
    },
  },
};
</script>

<style scoped>
/* Зона нажатия выше, чем видимая линия: в 3px трудно попасть пальцем. */
.scrub {
  position: relative;
  height: 16px;
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  touch-action: none; /* перетаскивание не прокручивает и не листает страницу */
  outline: none;
}

.track {
  position: relative;
  display: block;
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.22);
  transition: height 0.2s ease;
}

.scrub:hover .track,
.scrub:focus-visible .track,
.scrub.is-dragging .track {
  height: 6px;
}

.scrub:focus-visible .track {
  box-shadow: 0 0 0 2px var(--accent, #4d7dff);
}

.fill {
  position: absolute;
  inset: 0;
  background: #fff;
  transform: scaleX(0);
  transform-origin: left;
}
</style>
