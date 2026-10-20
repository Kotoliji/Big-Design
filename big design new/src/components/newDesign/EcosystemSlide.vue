<template>
  <!--
    Пятый экран: экосистема школы — спокойная типографика между визуальными сценами.
    Слева заголовок, справа четыре направления; при наведении в промежутке между ними
    к строке подъезжает превью работы или ученика. Появление запускает App.vue: enter()/leave().
  -->
  <section ref="panel" class="eco" @pointerleave="hovered = null">
    <SceneLights />
    <SiteNav class="reveal" current="#ecosystem" />

    <div class="copy">
      <p class="eyebrow reveal">{{ eyebrow }}</p>
      <h2 class="title reveal">{{ title }}</h2>
      <p class="lead reveal">{{ lead }}</p>
    </div>

    <ol class="list" :class="{ 'is-hovering': hovered !== null }">
      <li
        v-for="(item, i) in items"
        :key="item.title"
        class="row reveal"
        :class="{ 'is-active': hovered === i }"
        @pointerenter="hover(i, $event)"
      >
        <span class="num">0{{ i + 1 }}</span>
        <span class="name">{{ item.title }}</span>
        <span class="text">
          {{ item.text }}
          <a v-if="item.link" class="link" :href="joinUrl" target="_blank" rel="noopener">{{ item.link }} →</a>
        </span>
      </li>
    </ol>

    <!-- Превью — только украшение (на телефоне наведения нет, там его и не видно). -->
    <div
      class="preview"
      :class="{ 'is-on': hovered !== null }"
      :style="{ transform: `translateY(${previewY}px)` }"
      aria-hidden="true"
    >
      <img
        v-for="(item, i) in items"
        :key="item.title"
        :src="item.image"
        :class="{ 'is-on': hovered === i }"
        alt=""
        decoding="async"
      />
    </div>
  </section>
</template>

<script>
import SceneLights from "./SceneLights.vue";
import SiteNav from "./SiteNav.vue";
import { works } from "../../data/works.js";
import { reviews } from "../../data/reviews.js";

const poster = (slug) => works.find((w) => w.slug === slug)?.previewPoster;

// Четыре части экосистемы — из текста старого сайта («обучение, комьюнити, вызовы и развитие»).
const ITEMS = [
  { title: "Learning", text: "Courses and mentors: tools first, then style and taste.", image: poster("olga") },
  {
    title: "Community",
    text: "CG Arena club — artists sharing work, feedback and opportunities.",
    link: "Join CG Arena",
    image: reviews[1].posterWeb,
  },
  { title: "Challenges", text: "Live briefs and contests that push your portfolio forward.", image: poster("nikita") },
  { title: "Growth", text: "From the first render to a showreel and a creative career.", image: poster("saveliy") },
];

export default {
  name: "EcosystemSlide",
  components: { SceneLights, SiteNav },
  props: {
    eyebrow: { type: String, default: "Ecosystem" },
    title: { type: String, default: "One ecosystem for creative growth." },
    lead: {
      type: String,
      default:
        "Learning, community, challenges and growth in one place. Here you don't just learn software — you shape your vision, your style and an art director's way of thinking.",
    },
    items: { type: Array, default: () => ITEMS },
    joinUrl: { type: String, default: "https://web.tribute.tg/s/Alp" }, // как у кнопки Join в меню
    stagger: { type: Number, default: 90 },
  },
  data() {
    return {
      hovered: null,
      previewY: 0, // центр наведённой строки по вертикали, px от верха слайда
    };
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

    leave() {
      this.hovered = null;
    },

    // Превью подъезжает к наведённой строке по вертикали (сам переход — CSS transition).
    hover(i, e) {
      const row = e.currentTarget.getBoundingClientRect();
      const panel = this.$refs.panel.getBoundingClientRect();
      this.previewY = row.top + row.height / 2 - panel.top;
      this.hovered = i;
    },
  },
};
</script>

<style scoped>
.eco {
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
  width: min(36%, 560px);
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
  font-size: clamp(30px, 2.7vw, 52px);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.lead {
  max-width: 44ch;
  margin: clamp(16px, 1.4vw, 24px) 0 0;
  font-size: clamp(14px, 0.95vw, 18px);
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
  text-wrap: pretty;
}

/* Четыре строки, как оглавление: номер, название, пояснение; тонкие линии между ними. */
.list {
  position: absolute;
  top: 50%;
  right: clamp(24px, 6vw, 130px);
  width: min(48%, 820px);
  margin: 0;
  padding: 0;
  list-style: none;
  translate: 0 -50%;
}

.row {
  display: grid;
  grid-template-columns: 3.2em 1fr 1.25fr;
  align-items: baseline;
  gap: clamp(12px, 1.4vw, 28px);
  padding: clamp(18px, 2.2vh, 30px) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  transition: opacity 0.35s ease;
}

.row:last-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

/* Наведён один — остальные притихают. */
.list.is-hovering .row:not(.is-active) {
  opacity: 0.4;
}

.num {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.35s;
}

.row.is-active .num {
  color: var(--accent);
}

.name {
  font-family: "Jura", system-ui, sans-serif;
  font-size: clamp(24px, 2.2vw, 42px);
  font-weight: 500;
  line-height: 1.1;
  transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.row.is-active .name {
  transform: translateX(10px);
}

.text {
  font-size: clamp(13px, 0.85vw, 16px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.6);
}

.link {
  display: inline-block;
  margin-top: 6px;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  transition: border-color 0.25s;
}

.link:hover {
  border-color: #fff;
}

/* Превью в промежутке слева от списка; по вертикали его ставит код (translateY к центру строки),
   translate: -50% центрует карточку на этой линии. Подъезд и появление — переходы. */
.preview {
  position: absolute;
  top: 0;
  right: calc(clamp(24px, 6vw, 130px) + min(48%, 820px) + clamp(28px, 3vw, 64px));
  z-index: 3;
  width: clamp(160px, 12vw, 240px);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  opacity: 0;
  translate: 0 -50%;
  pointer-events: none;
  transition:
    transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 0.35s ease;
}

.preview.is-on {
  opacity: 1;
}

.preview img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  scale: 1.08;
  transition: opacity 0.35s ease, scale 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.preview img.is-on {
  opacity: 1;
  scale: 1;
}

/* Узкий вертикальный экран: текст сверху, список под ним; превью нет (нет наведения и места). */
@media (max-width: 900px) and (orientation: portrait) {
  .preview {
    display: none;
  }
  .copy {
    top: 14%;
    width: calc(100% - clamp(40px, 12vw, 80px));
    left: clamp(20px, 6vw, 40px);
    translate: none;
  }
  .lead {
    font-size: 14px;
  }
  .list {
    top: auto;
    bottom: 6%;
    left: clamp(20px, 6vw, 40px);
    right: auto;
    width: calc(100% - clamp(40px, 12vw, 80px));
    translate: none;
  }
  .row {
    grid-template-columns: 2.4em 1fr;
    padding: 14px 0;
  }
  .text {
    grid-column: 2;
  }
}

/* Телефон боком: текст короче, строки плотнее, всё ниже шапки. */
@media (orientation: landscape) and (max-height: 500px) {
  .copy,
  .list {
    top: calc(50% + 36px);
  }
  .lead {
    display: none;
  }
  .row {
    padding: 8px 0;
  }
}

/* Превью живёт в промежутке между текстом и списком: на узком экране промежутка нет,
   на сенсорном — наведения. */
@media (max-width: 1280px), (hover: none) {
  .preview {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .name,
  .preview,
  .preview img {
    transition: none;
  }
}
</style>
