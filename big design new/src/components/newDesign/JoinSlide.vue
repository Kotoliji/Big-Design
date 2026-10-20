<template>
  <!--
    Финальный экран: призыв вступить в CG Arena. Слева заголовок и кнопка, справа — ролик
    о том, как всё устроено (из старого сайта): постер, по клику играет прямо в карточке со звуком.
    Появление запускает App.vue: enter()/leave() при смене слайда.
  -->
  <section ref="panel" class="join">
    <SceneLights />
    <SiteNav class="reveal" />

    <div class="copy">
      <p class="eyebrow reveal">{{ eyebrow }}</p>
      <h2 class="title reveal">{{ title }}</h2>
      <p class="lead reveal">{{ lead }}</p>
      <a class="cta reveal" :href="joinUrl" target="_blank" rel="noopener">{{ ctaLabel }}</a>
    </div>

    <div class="video reveal" :class="{ 'is-playing': playing }">
      <!-- Пока не нажали — только постер: ролик на 30 МБ без спроса не качаем (src ставит play). -->
      <button v-show="!playing" type="button" class="video-cover" :aria-label="`${playLabel}: ${videoTitle}`" @click="play">
        <img :src="poster" alt="" decoding="async" />
        <span class="play" aria-hidden="true">▶</span>
        <span class="video-caption">
          <span>{{ videoTitle }}</span>
          <span class="video-time">{{ videoDuration }}</span>
        </span>
      </button>
      <video v-show="playing" ref="video" :poster="poster" controls playsinline preload="none"></video>
    </div>
  </section>
</template>

<script>
import SceneLights from "./SceneLights.vue";
import SiteNav from "./SiteNav.vue";

export default {
  name: "JoinSlide",
  components: { SceneLights, SiteNav },
  props: {
    eyebrow: { type: String, default: "Join" },
    title: { type: String, default: "Your place in the arena." },
    lead: {
      type: String,
      default: "Learning, community and real projects in one club. Your next work starts here.",
    },
    ctaLabel: { type: String, default: "Join CG Arena" },
    joinUrl: { type: String, default: "https://web.tribute.tg/s/Alp" }, // как у кнопки Join в меню
    videoSrc: { type: String, default: "/video_with_instraction/Video_Present1.mp4" },
    poster: { type: String, default: "/video_with_instraction/poster_1280.jpg" },
    videoTitle: { type: String, default: "How CG Arena works" },
    videoDuration: { type: String, default: "5:32" },
    playLabel: { type: String, default: "Play" },
    stagger: { type: Number, default: 110 },
  },
  data() {
    return { playing: false };
  },
  created() {
    this._anims = [];
  },
  unmounted() {
    this._anims.forEach((a) => a.cancel());
  },
  methods: {
    // slideMs — длительность въезда слайда (передаёт App.vue).
    enter(slideMs) {
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
      Promise.all(anims.map((a) => a.finished)).then(
        () => anims.forEach((a) => a.cancel()), // итог совпадает с обычными стилями
        () => {} // отказ = наш же cancel при повторном входе
      );
    },

    // Ушли со слайда — останавливаем ролик и обрываем его загрузку, карточка снова с постером.
    leave() {
      const { video } = this.$refs;
      video.pause();
      video.removeAttribute("src");
      video.load();
      this.playing = false;
    },

    // Прямо в обработчике клика (без ожиданий): тогда play() со звуком разрешают все браузеры, и Safari тоже.
    play() {
      const { video } = this.$refs;
      if (!video.getAttribute("src")) video.src = this.videoSrc;
      this.playing = true;
      video.play().catch(() => {}); // не дали — остаются обычные кнопки плеера
    },
  },
};
</script>

<style scoped>
.join {
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

.copy {
  position: absolute;
  top: 50%;
  left: clamp(24px, 6vw, 130px);
  width: min(34%, 520px);
  translate: 0 -50%;
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

.title {
  margin: 0;
  font-family: "Jura", system-ui, sans-serif;
  font-size: clamp(34px, 3.2vw, 62px);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.lead {
  max-width: 38ch;
  margin: clamp(16px, 1.4vw, 24px) 0 0;
  font-size: clamp(15px, 1vw, 19px);
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  text-wrap: pretty;
}

/* Главная кнопка — как Join в меню, только крупнее. */
.cta {
  display: inline-block;
  margin-top: clamp(28px, 3vw, 48px);
  padding: 18px 34px;
  border-radius: 14px;
  background: #fff;
  color: #000;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.25s, box-shadow 0.25s;
}

.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(255, 255, 255, 0.12);
}

/* Ролик: карточка 16:9 справа. */
.video {
  position: absolute;
  top: 50%;
  right: clamp(24px, 6vw, 130px);
  width: min(46vw, 880px);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 14px;
  background: #000;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.7);
  translate: 0 -50%;
}

.video-cover {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.video-cover img,
.video video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Затемнение снизу — под подписью. */
.video-cover::after {
  content: "";
  position: absolute;
  inset: 50% 0 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.65));
  pointer-events: none;
}

.play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  width: clamp(60px, 5vw, 84px);
  aspect-ratio: 1;
  padding-left: 4px; /* треугольник визуально по центру */
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  font-size: clamp(16px, 1.3vw, 22px);
  translate: -50% -50%;
  transition: background 0.25s, scale 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.video-cover:hover .play,
.video-cover:focus-visible .play {
  background: rgba(0, 0, 0, 0.55);
  scale: 1.08;
}

.video-cover:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.video-caption {
  position: absolute;
  right: 22px;
  bottom: 18px;
  left: 22px;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.video-time {
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.6);
}

/* Узкий вертикальный экран: текст и кнопка сверху, ролик под ними во всю ширину. */
@media (max-width: 900px) and (orientation: portrait) {
  .copy {
    top: 14%;
    left: clamp(20px, 6vw, 40px);
    width: calc(100% - clamp(40px, 12vw, 80px));
    translate: none;
  }
  .video {
    top: 50%;
    right: clamp(20px, 6vw, 40px);
    width: calc(100% - clamp(40px, 12vw, 80px));
    translate: none;
  }
}

/* Телефон боком: короче текст, всё ниже шапки. */
@media (orientation: landscape) and (max-height: 500px) {
  .copy,
  .video {
    top: calc(50% + 36px);
  }
  .lead {
    display: none;
  }
  .cta {
    margin-top: 18px;
    padding: 12px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta,
  .play {
    transition: none;
  }
}
</style>
