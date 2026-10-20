<template>
  <!--
    Главный экран «CG Arena»: чёрная сцена с лучами света, металлическая надпись стоит на мокром полу.
    Картинки готовит scripts/make-hero-images.py. Появление запускает WorksStack вызовом play():
    элементы выходят по очереди — лучи, надпись, отражение, стрелка, слоган, подписи и меню.
  -->
  <section ref="root" class="arena" :class="{ 'is-playing': playing }">
    <SceneLights :lit="playing" />

    <div class="content">
      <SiteNav class="reveal" current="#cg-arena" />

      <SideLabels :items="sideLeft" />
      <SideLabels :items="sideRight" align="right" />

      <div class="stage">
        <i class="spill" aria-hidden="true"></i>
        <h1 ref="logo" class="logo">
          <img
            class="logo-img"
            src="/hero/cg_arena.webp"
            srcset="/hero/cg_arena_960.webp 960w, /hero/cg_arena.webp 1920w"
            sizes="(max-width: 900px) 92vw, 67vw"
            alt="CG Arena"
            decoding="async"
          />
          <img class="glow" src="/hero/cg_arena_glow.webp" alt="" aria-hidden="true" />
          <!-- Блик: полоса света, видимая только внутри букв (mask по той же картинке). -->
          <span class="shine" aria-hidden="true"><i ref="shineBar"></i></span>
          <img ref="reflection" class="reflection" src="/hero/cg_arena_reflection.webp" alt="" aria-hidden="true" />
        </h1>

        <!-- Стрелка. Свечение — фильтром внутри SVG (viewBox с запасом 20 по краям под размытие):
             CSS filter + clip-path на самом SVG Chrome рисовал чёрным прямоугольником. -->
        <div ref="arrow" class="arrow" aria-hidden="true">
          <svg viewBox="-20 -20 640 84">
            <defs>
              <linearGradient id="arena-arrow-metal" x1="0" x2="1">
                <stop offset="0" stop-color="#c9ced6" />
                <stop offset="0.5" stop-color="#ffffff" />
                <stop offset="1" stop-color="#cfd4db" />
              </linearGradient>
              <filter id="arena-arrow-glow" x="-5%" y="-60%" width="110%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="near" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="far" />
                <feMerge>
                  <feMergeNode in="far" />
                  <feMergeNode in="near" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M0 42 L62 0 L52 32 L600 32 L600 42 Z"
              fill="url(#arena-arrow-metal)"
              filter="url(#arena-arrow-glow)"
            />
          </svg>
        </div>

        <p ref="tagline" class="tagline">{{ tagline }}</p>
      </div>
    </div>
  </section>
</template>

<script>
import SceneLights from "./SceneLights.vue";
import SiteNav from "./SiteNav.vue";
import SideLabels from "./SideLabels.vue";

const EASE_OUT = "cubic-bezier(.2,.7,.2,1)";

export default {
  name: "ArenaHero",
  components: { SceneLights, SiteNav, SideLabels },
  props: {
    tagline: { type: String, default: "BigDesign school of CG and motion design" },
    sideLeft: { type: Array, default: () => ["Skills", "People", "Ideas", "Real worlds"] },
    sideRight: { type: Array, default: () => ["CG", "Motion", "VFX", "Creative careers"] },
    shineEveryMs: { type: Number, default: 7000 },
  },
  data() {
    // visible — экран сейчас на виду; за экраном блик не нужен.
    return { playing: false, played: false, visible: true, anims: [], shineTimer: null };
  },
  unmounted() {
    this.stopIdle();
    this.anims.forEach((a) => a.cancel());
  },
  methods: {
    // Появление. Промис завершается, когда отыграли все анимации.
    async play() {
      if (this.played) return;
      this.played = true;
      this.playing = true;

      this.animateRise();

      // Отказ — это cancel() при размонтировании, доигрывать уже нечего.
      const done = await Promise.all(this.anims.map((a) => a.finished)).then(() => true, () => false);
      if (!done) return;
      // Итог анимаций совпадает с обычными стилями — снимаем их, чтобы не держать лишние слои.
      this.anims.forEach((a) => a.cancel());
      this.anims = [];
      if (!this.visible) return;
      this.runShine();
      this.startIdle();
    },

    track(el, keyframes, options) {
      const anim = el.animate(keyframes, { easing: EASE_OUT, ...options });
      this.anims.push(anim);
      return anim;
    },

    animateRise() {
      const { root, logo, reflection, arrow, tagline } = this.$refs;
      const both = { fill: "both" };
      const fadeUp = (distance) => [
        { opacity: 0, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: "translateY(0)" },
      ];

      root.querySelectorAll(".beam").forEach((beam, n) =>
        this.track(beam, [{ opacity: 0, transform: "scaleY(0.4)" }, { opacity: 1, transform: "scaleY(1)" }], {
          ...both,
          duration: 1600,
          delay: n * 180,
        })
      );
      this.track(
        logo,
        [
          { opacity: 0, transform: "translateY(28px) scale(0.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { ...both, duration: 1400, delay: 250 }
      );
      this.track(reflection, [{ opacity: 0 }, { opacity: 1 }], { ...both, duration: 1600, delay: 900 });
      this.track(arrow, [{ clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0)" }], {
        ...both,
        duration: 900,
        delay: 1100,
      });
      this.track(tagline, fadeUp(12), { ...both, duration: 900, delay: 1400 });
      root.querySelectorAll(".reveal").forEach((el, n) =>
        this.track(el, fadeUp(10), { ...both, duration: 700, delay: 1500 + n * 60 })
      );
    },

    // Полоса света один раз проходит по буквам слева направо.
    runShine() {
      this.$refs.shineBar?.animate(
        [{ transform: "translateX(-120%) skewX(-20deg)" }, { transform: "translateX(560%) skewX(-20deg)" }],
        { duration: 1700, easing: "cubic-bezier(.4,0,.2,1)" }
      );
    },
    startIdle() {
      this.stopIdle();
      this.shineTimer = setInterval(this.runShine, this.shineEveryMs);
    },
    stopIdle() {
      clearInterval(this.shineTimer);
      this.shineTimer = null;
    },

    // Экран уехал или вернулся — блик за экраном не нужен.
    pause() {
      this.visible = false;
      this.stopIdle();
    },
    resume() {
      this.visible = true;
      if (this.played) this.startIdle();
    },
  },
};
</script>

<style scoped>
.arena {
  --horizon: 62%;                /* линия пола: на ней стоят буквы */
  --stage-w: min(67vw, 1300px);  /* ширина надписи */
  --logo-ratio: 0.1546;          /* высота / ширина картинки надписи */
  --logo-base: 0.9387;           /* низ букв, доля высоты картинки (снизу поле PAD) */
  --light: 232, 238, 248;

  position: absolute;
  inset: 0;
  overflow: hidden;
  color: #fff;
  background: radial-gradient(110% 75% at 50% 40%, #0c0c0d 0%, #050505 50%, #000 100%);
  font-family: "Inter", system-ui, sans-serif;
}

.content {
  position: absolute;
  inset: 0;
}

/* До появления содержимое скрыто — его проявляют анимации play() (fill: both). */
.arena:not(.is-playing) :is(.site-nav, .labels, .stage) {
  opacity: 0;
}

/* --- центр --- */

/* Сцена начинается от линии пола; надпись поднята так, что низ букв лежит ровно на ней. */
.stage {
  position: absolute;
  top: var(--horizon);
  left: 50%;
  width: var(--stage-w);
  translate: -50% 0;
  text-align: center;
}

/* Свет из-за букв падает на пол у их основания. */
.spill {
  position: absolute;
  top: 0;
  left: 50%;
  width: 125%;
  height: clamp(160px, 26vh, 320px);
  translate: -50% -50%;
  background: radial-gradient(50% 50% at 50% 50%, rgba(var(--light), 0.1), transparent 70%);
  pointer-events: none;
}

.logo {
  position: relative;
  margin: calc(var(--stage-w) * var(--logo-ratio) * var(--logo-base) * -1) 0 0;
}

.logo-img {
  display: block;
  width: 100%;
  height: auto;
}

/* Свечение граней: картинка шире надписи на поле GLOW_PAD (90px из 1688×261). */
.glow {
  position: absolute;
  top: -34.48%;
  left: -5.33%;
  width: 110.66%;
  height: 168.97%;
  pointer-events: none;
}

.shine {
  position: absolute;
  inset: 0 0 auto;
  aspect-ratio: 1688 / 261;
  overflow: hidden;
  mask: url("/hero/cg_arena.webp") center / 100% 100% no-repeat;
  pointer-events: none;
}

.shine i {
  position: absolute;
  inset: 0 auto 0 0;
  width: 16%;
  transform: translateX(-120%) skewX(-20deg);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
}

/* Отражение прижато к низу букв: у картинки поле PAD снизу, у отражения — такое же сверху. */
.reflection {
  position: absolute;
  top: calc(100% * (2 * var(--logo-base) - 1));
  left: 0;
  width: 100%;
  height: auto;
  pointer-events: none;
}

/* Стрелка 600 единиц шириной занимает 55% сцены с отступом 21%;
   viewBox шире на 20 единиц с каждой стороны — отсюда пересчитанные ширина и отступы. */
.arrow {
  width: calc(55% * 640 / 600);
  margin: calc(clamp(18px, 3vw, 58px) - var(--stage-w) * 0.55 * 20 / 600) 0 0 calc(21% - 55% * 20 / 600);
}

.arrow svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.tagline {
  margin: clamp(10px, 1.6vw, 34px) 0 0;
  font-size: clamp(13px, 1vw, 20px);
  font-weight: 300;
  letter-spacing: 0.36em;
  color: rgba(255, 255, 255, 0.72);
}

@media (max-width: 900px) {
  .arena {
    --horizon: 50%;
    --stage-w: 92vw;
  }
  .tagline {
    font-size: 12px;
    letter-spacing: 0.16em;
  }
}
</style>
