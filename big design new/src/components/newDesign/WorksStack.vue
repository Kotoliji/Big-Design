<template>
  <!--
    Первый экран. Логотип BIG DESIGN висит поверх всего с самого начала.
    1. Колода: карты работ перебираются снизу вверх, следующая стартует, пока предыдущая ещё едет.
    2. Колода размывается, поверх проявляется сцена CG Arena и разъезжается на весь экран.
    3. Логотип гаснет по буквам, сцена проигрывает появление. Колода удаляется из DOM.
  -->
  <section class="hero">
    <div ref="frame" class="frame" aria-hidden="true">
      <template v-if="!deckGone">
        <div
          v-for="(item, i) in items"
          :key="item.slug"
          :ref="(el) => (cardEls[i] = el)"
          class="card"
        >
          <img :src="item.previewPoster" class="card-media" alt="" decoding="async" />
        </div>
      </template>
    </div>

    <!-- Сцена сразу во весь экран, но обрезана clip-path до кадра колоды: разъезд — анимация clip-path. -->
    <div ref="finale" class="finale">
      <ArenaHero ref="arena" />
    </div>

    <div ref="title" class="title" aria-hidden="true">
      <div ref="titleBlock" class="title-block">
        <span class="line line-1">
          <span v-for="(ch, n) in titleLines[0]" :key="'a' + n" class="ch">{{ ch }}</span>
          <sup v-if="registered" class="ch reg">®</sup>
        </span>
        <span class="line line-2">
          <span v-for="(ch, n) in titleLines[1]" :key="'b' + n" class="ch">{{ ch }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import ArenaHero from "./ArenaHero.vue";
import { works } from "../../data/works.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Скачать и декодировать заранее, чтобы карта не вылетала пустой.
function preloadImage(src) {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => {});
}

export default {
  name: "WorksStack",
  components: { ArenaHero },
  props: {
    // Колода
    interval: { type: Number, default: 130 },       // шаг между картами; меньше flight — карты перекрываются
    flight: { type: Number, default: 520 },         // полёт одной карты
    lastFlight: { type: Number, default: 1000 },    // последняя карта медленнее — колода «садится»
    preloadMaxMs: { type: Number, default: 1500 },  // дольше не ждём постеры, стартуем как есть

    // Переход к сцене
    beforeFinale: { type: Number, default: 350 },
    blurInMs: { type: Number, default: 700 },
    expandMs: { type: Number, default: 1200 },
    blurPx: { type: Number, default: 22 },          // размытие колоды (маленький слой — это дёшево)
    titleScale: { type: Number, default: 1.3 },

    // Логотип
    letterOutMs: { type: Number, default: 650 },
    letterStagger: { type: Number, default: 70 },
    titleLines: { type: Array, default: () => ["BIG", "DESIGN"] },
    registered: { type: Boolean, default: true },
  },
  emits: ["done"],
  data() {
    return {
      items: works,
      cardEls: [],
      anims: [],
      timer: null,
      finaleTimer: null,
      tick: 0,
      preloading: true,
      finaleStarted: false,
      deckGone: false,
    };
  },
  async mounted() {
    document.addEventListener("visibilitychange", this.onVisibility);
    await Promise.race([
      Promise.all(this.items.map((w) => preloadImage(w.previewPoster))),
      wait(this.preloadMaxMs),
    ]);
    this.preloading = false;
    if (!document.hidden) this.start();
  },
  unmounted() {
    this.stop();
    clearTimeout(this.finaleTimer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.anims.forEach((a) => a?.cancel());
  },
  methods: {
    /* ---------- колода ---------- */

    dealNext() {
      if (this.tick >= this.items.length) {
        this.stop();
        // Вкладка могла уйти в фон и вернуться уже на последней карте — таймер ставим один раз.
        this.finaleTimer ??= setTimeout(this.startFinale, this.lastFlight + this.beforeFinale);
        return;
      }

      const i = this.tick;
      const el = this.cardEls[i];
      if (!el) return;

      const isLast = i === this.items.length - 1;
      el.style.zIndex = String(i + 1);
      this.anims[i]?.cancel();
      this.anims[i] = el.animate(
        [{ transform: "translate3d(0, 104%, 0)" }, { transform: "translate3d(0, 0, 0)" }],
        {
          duration: isLast ? this.lastFlight : this.flight,
          // Быстрый старт и долгое торможение: перекрытие карт читается как поток.
          easing: isLast ? "cubic-bezier(.3,.55,.2,1)" : "cubic-bezier(.22,.8,.28,1)",
          fill: "forwards",
        }
      );
      this.tick++;
    },

    releaseDeck() {
      this.stop();
      this.anims.forEach((a) => a?.cancel());
      this.anims = [];
      this.cardEls = [];
      this.deckGone = true;
    },

    /* ---------- переход к сцене ---------- */

    async startFinale() {
      if (this.finaleStarted) return;
      this.finaleStarted = true;

      const { frame, finale, titleBlock, arena } = this.$refs;
      const fromClip = this.frameClip(frame.getBoundingClientRect());
      finale.style.clipPath = fromClip;
      finale.style.visibility = "visible";

      // Итоговые значения пишем в style сразу после старта анимации: пока она идёт,
      // она важнее inline-стиля, а после окончания не будет мигания к начальному кадру.

      // 1. Колода размывается, сцена проявляется поверх.
      const soft = { duration: this.blurInMs, easing: "ease-in-out" };
      const deckBlur = frame.animate(
        [{ filter: "blur(0px)" }, { filter: `blur(${this.blurPx}px)` }],
        { ...soft, fill: "forwards" }
      );
      const fadeIn = finale.animate([{ opacity: 0 }, { opacity: 1 }], soft);
      finale.style.opacity = "1";
      await fadeIn.finished;
      this.releaseDeck();

      // 2. Разъезд до краёв экрана.
      const move = { duration: this.expandMs, easing: "cubic-bezier(.65,0,.2,1)" };
      titleBlock.animate(
        [{ transform: "scale(1)" }, { transform: `scale(${this.titleScale})` }],
        { ...move, fill: "forwards" }
      );
      const grow = finale.animate([{ clipPath: fromClip }, { clipPath: "inset(0px 0px 0px 0px)" }], move);
      finale.style.clipPath = "none";
      await grow.finished;
      deckBlur.cancel(); // колода под сценой уже пустая — фильтр больше не нужен

      // 3. Логотип гаснет, и пока исчезают последние буквы, сцена начинает появляться.
      const titleOut = this.hideTitle();
      await wait(this.letterOutMs);
      await Promise.all([arena.play(), titleOut]);
      this.$emit("done");
    },

    // Прямоугольник кадра колоды в координатах экрана — для clip-path: inset().
    frameClip(box) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return `inset(${box.top}px ${vw - box.right}px ${vh - box.bottom}px ${box.left}px)`;
    },

    // Буквы гаснут волной: у каждой своя задержка.
    hideTitle() {
      const chars = this.$refs.title.querySelectorAll(".ch");
      const anims = [...chars].map((ch, n) =>
        ch.animate(
          [
            { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
            { opacity: 0, filter: "blur(8px)", transform: "translateY(-0.25em)" },
          ],
          {
            duration: this.letterOutMs,
            delay: n * this.letterStagger,
            easing: "cubic-bezier(.4,0,.2,1)",
            fill: "forwards",
          }
        )
      );
      return Promise.all(anims.map((a) => a.finished)).then(() => {
        this.$refs.title.style.visibility = "hidden";
      });
    },

    // Сразу показать итог интро — когда страницу открыли не с первого экрана (App.jumpTo).
    skip() {
      if (this.finaleStarted && this.deckGone) return;
      clearTimeout(this.finaleTimer);
      this.releaseDeck();
      this.finaleStarted = true;
      const { finale, title, arena } = this.$refs;
      Object.assign(finale.style, { visibility: "visible", opacity: "1", clipPath: "none" });
      title.style.visibility = "hidden";
      arena.play();
    },

    // Экран уехал / вернулся (App.vue).
    pauseHero() {
      this.$refs.arena?.pause();
    },
    resumeHero() {
      this.$refs.arena?.resume();
    },

    /* ---------- управление ---------- */

    start() {
      if (this.timer || this.preloading || this.finaleStarted || this.deckGone) return;
      this.dealNext();
      this.timer = setInterval(this.dealNext, this.interval);
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    },
    onVisibility() {
      if (document.hidden) this.stop();
      else this.start();
    },
  },
};
</script>

<style scoped>
.hero {
  --frame-w: min(340px, 76vw); /* от ширины кадра считается и размер логотипа */

  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #fff;
}

.frame {
  position: relative;
  width: var(--frame-w);
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #0a0a0a;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
}

.card {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transform: translate3d(0, 104%, 0);
  box-shadow: 0 -12px 24px rgba(0, 0, 0, 0.45);
  will-change: transform;
}

.card-media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Слой сцены: скрыт до разъезда, после — обычный кликабельный экран. */
.finale {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: hidden;
  background: #000;
  opacity: 0;
  visibility: hidden;
}

/* --- логотип --- */

.title {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.title-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #fff;
  font-family: "Jura", system-ui, sans-serif;
  font-weight: 400;
  font-size: calc(var(--frame-w) * 0.1);
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
  will-change: transform;
}

/* DESIGN сдвинуто вправо лесенкой */
.line-2 {
  padding-left: 1.45em;
}

.ch {
  display: inline-block; /* transform не работает на inline */
  white-space: pre;
}

.reg {
  margin-top: 0.15em;
  margin-left: 0.2em;
  font-size: 0.34em;
  vertical-align: top;
}

@media (max-width: 600px) {
  .hero {
    --frame-w: 82vw;
  }
}
</style>
