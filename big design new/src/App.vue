<template>
  <!--
    Страница — стопка полноэкранных слайдов (.screen). Обычной прокрутки нет:
    колесо / свайп / стрелки уводят текущий слайд вверх, а следующий вводят снизу.
    Слайд 0 — колода работ и заставка (WorksStack), слайд 1 — о школе (AboutReveal),
    слайд 2 — галерея работ (WorksGallery). Старая версия страницы целиком лежит в src/App.old.vue.
  -->
  <div ref="screen0" class="screen">
    <WorksStack ref="intro" @done="onIntroDone" />
  </div>
  <div ref="screen1" class="screen is-below">
    <AboutReveal ref="about" />
  </div>
  <div ref="screen2" class="screen is-below">
    <WorksGallery ref="gallery" />
  </div>
</template>

<script>
import WorksStack from "./components/newDesign/WorksStack.vue";
import AboutReveal from "./components/newDesign/AboutReveal.vue";
import WorksGallery from "./components/newDesign/WorksGallery.vue";

// Длительность перехода между слайдами, мс.
const SLIDE_MS = 1000;
// После перехода ещё столько мс игнорируем колесо: тачпад по инерции
// шлёт события ещё долго, и без паузы пролистнуло бы сразу через слайд.
const COOLDOWN_MS = 450;
// Минимальная длина свайпа на телефоне, px.
const SWIPE_PX = 50;
// Пауза в событиях колеса, после которой считаем, что начался новый жест, мс.
const GESTURE_GAP_MS = 180;

export default {
  name: "App",
  components: { WorksStack, AboutReveal, WorksGallery },
  data() {
    return {
      current: 0,       // какой слайд сейчас на экране
      unlocked: false,  // пока идёт интро — листать нельзя
      lockUntil: 0,     // до какого момента игнорируем ввод (идёт анимация)
      touchY: null,
      lastWheelAt: -Infinity,
      wheelUsed: false, // текущий жест колеса уже сделал свой шаг
      anims: [],        // текущая анимация каждого слайда
    };
  },
  computed: {
    screens() {
      return [this.$refs.screen0, this.$refs.screen1, this.$refs.screen2];
    },
    // Компоненты слайдов — у них спрашиваем про внутренние шаги (см. step).
    slides() {
      return [this.$refs.intro, this.$refs.about, this.$refs.gallery];
    },
  },
  mounted() {
    window.addEventListener("wheel", this.onWheel, { passive: true });
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("touchstart", this.onTouchStart, { passive: true });
    window.addEventListener("touchend", this.onTouchEnd, { passive: true });

    // Для разработки: ?slide=1 в адресе — сразу открыть нужный слайд, без интро.
    const startSlide = Number(new URLSearchParams(location.search).get("slide"));
    if (startSlide > 0) this.jumpTo(startSlide);
  },
  unmounted() {
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("touchstart", this.onTouchStart);
    window.removeEventListener("touchend", this.onTouchEnd);
  },
  methods: {
    // Интро закончилось (логотип погас) — разрешаем листать.
    onIntroDone() {
      this.unlocked = true;
      // 3D на следующем слайде инициализируется только сейчас: компиляция шейдеров
      // и разбор модели морозят поток на ~1 с и раньше рвали анимацию колоды.
      this.$refs.about.prepare();
    },

    /* ---------- переход между слайдами ---------- */

    // Шаг колеса / свайпа / клавиш. Сначала даём слайду обработать его у себя
    // (на слайде «О школе» телефон выезжает в центр) — и только если не взял, листаем.
    step(dir) {
      if (!this.unlocked || Date.now() < this.lockUntil) return;
      const innerMs = this.slides[this.current].scrollStep?.(dir);
      if (innerMs) this.lockUntil = Date.now() + innerMs + COOLDOWN_MS;
      else this.goTo(this.current + dir);
    },

    async goTo(target) {
      if (target < 0 || target >= this.screens.length || target === this.current) return;
      this.lockUntil = Date.now() + SLIDE_MS + COOLDOWN_MS;

      const from = this.current;
      // dir = 1 — идём вниз (старый уезжает вверх), -1 — возвращаемся.
      const dir = target > from ? 1 : -1;
      this.current = target;

      this.beforeEnter(target);

      const opts = { duration: SLIDE_MS, easing: "cubic-bezier(.65,0,.2,1)", fill: "forwards" };
      // Оба слайда едут одновременно и на одну и ту же высоту экрана —
      // поэтому между ними нет щели, выглядит как одна длинная лента.
      this.animateScreen(from, [0, -100 * dir], opts);
      await this.animateScreen(target, [100 * dir, 0], opts).finished;

      this.afterLeave(from);
    },

    // Мгновенно поставить слайд i на экран (без анимации).
    jumpTo(i) {
      if (i >= this.screens.length) return;
      this.unlocked = true;
      this.screens.forEach((el, n) => {
        el.classList.remove("is-below");
        el.style.transform = `translate3d(0, ${(n - i) * 100}%, 0)`;
      });
      this.current = i;
      // Интро пропускаем: первый экран сразу в итоговом виде, чтобы можно было вернуться на него.
      if (i > 0) this.$refs.intro.skip();
      this.screens.forEach((_, n) => (n === i ? this.beforeEnter(n) : this.afterLeave(n)));
    },

    // Двигаем слайд по Y из from% в to% высоты экрана.
    animateScreen(i, [fromY, toY], opts) {
      const el = this.screens[i];
      // Прошлую анимацию слайда снимаем — иначе они копятся друг на друге.
      this.anims[i]?.cancel();
      el.classList.remove("is-below");
      this.anims[i] = el.animate(
        [
          { transform: `translate3d(0, ${fromY}%, 0)` },
          { transform: `translate3d(0, ${toY}%, 0)` },
        ],
        opts
      );
      return this.anims[i];
    },

    // Слайд начинает въезжать — включаем в нём видео / анимацию появления.
    beforeEnter(i) {
      if (i === 0) this.$refs.intro.resumeHero();
      if (i === 1) this.$refs.about.enter(SLIDE_MS);
      if (i === 2) this.$refs.gallery.enter(SLIDE_MS);
    },
    // Слайд уехал за экран — выключаем его видео, чтобы не декодировать зря.
    afterLeave(i) {
      if (i === 0) this.$refs.intro.pauseHero();
      if (i === 1) this.$refs.about.leave();
      if (i === 2) this.$refs.gallery.leave();
    },

    /* ---------- ввод ---------- */

    // Один жест — один шаг: инерция тачпада шлёт события ещё секунду-две, и без этого хвост жеста
    // после паузы COOLDOWN_MS делал бы второй шаг (например, сразу выдвигал телефон на новом слайде).
    onWheel(e) {
      if (e.timeStamp - this.lastWheelAt > GESTURE_GAP_MS) this.wheelUsed = false;
      this.lastWheelAt = e.timeStamp;
      if (this.wheelUsed || Math.abs(e.deltaY) < 15) return; // < 15 — мелкое дрожание тачпада
      this.wheelUsed = true;
      this.step(e.deltaY > 0 ? 1 : -1);
    },
    onKey(e) {
      // Пробел на кнопке или ссылке — это её нажатие, а не листание.
      if (e.key === " " && e.target.closest?.("button, a, input, textarea, select")) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) this.step(1);
      if (["ArrowUp", "PageUp"].includes(e.key)) this.step(-1);
    },
    onTouchStart(e) {
      this.touchY = e.touches[0].clientY;
    },
    onTouchEnd(e) {
      if (this.touchY === null) return;
      const dy = this.touchY - e.changedTouches[0].clientY; // >0 — палец ушёл вверх
      this.touchY = null;
      if (Math.abs(dy) < SWIPE_PX) return;
      this.step(dy > 0 ? 1 : -1);
    },
  },
};
</script>

<style>
/* Слайд — окно на весь экран. Все слайды лежат друг на друге,
   видно только тот, что сейчас в translateY(0). */
.screen {
  position: fixed;
  inset: 0;
  overflow: hidden;
  will-change: transform;
}

/* Стартовое положение ещё не показанных слайдов — под экраном. */
.screen.is-below {
  transform: translate3d(0, 100%, 0);
}
</style>
