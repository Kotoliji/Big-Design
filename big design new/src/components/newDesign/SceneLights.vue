<template>
  <!--
    Общая сцена тёмных экранов: лучи света сверху и мокрый пол.
    Размеры берутся из родителя через переменную --horizon (линия пола).
    lit=false — лучи погашены, пока экран не начал появляться.
  -->
  <div class="scene" :class="{ 'is-dark': !lit }" aria-hidden="true">
    <div class="beams">
      <i v-for="n in 3" :key="n" class="beam" :class="`beam-${n}`"></i>
    </div>
    <div class="floor"></div>
  </div>
</template>

<script>
export default {
  name: "SceneLights",
  props: {
    lit: { type: Boolean, default: true },
  },
};
</script>

<style scoped>
.scene {
  --horizon-line: var(--horizon, 62%);
  --light: 232, 238, 248;

  position: absolute;
  inset: 0;
  pointer-events: none;
}

.beams {
  position: absolute;
  inset: 0;
}

/* Луч: узкое яркое ядро сверху + тонкая дымка. Мягкие края — градиентами и маской, без filter. */
.beam {
  position: absolute;
  top: -8%;
  height: calc(var(--horizon-line) + 8%);
  width: 16vw;
  transform-origin: top;
  background:
    radial-gradient(24% 85% at 50% 0%, rgba(var(--light), 0.15), transparent 100%),
    linear-gradient(to bottom, rgba(var(--light), 0.05), rgba(var(--light), 0.015) 70%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 50%, transparent);
  animation: breathe 6s ease-in-out infinite alternate;
}

.beam-1 { left: calc(22% - 8vw); }
.beam-2 { left: calc(50% - 5vw); width: 10vw; opacity: 0.45; animation-delay: -2s; }
.beam-3 { left: calc(78% - 8vw); animation-delay: -4s; }

.is-dark .beam {
  opacity: 0;
}

@keyframes breathe {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

/* Мокрый пол: пятна света под лучами, вертикальные блики, фактура бетона только там, где на неё падает свет. */
.floor {
  position: absolute;
  inset: var(--horizon-line) 0 0;
  background:
    radial-gradient(14% 9% at 22% 7%, rgba(var(--light), 0.12), transparent 100%),
    radial-gradient(14% 9% at 78% 7%, rgba(var(--light), 0.12), transparent 100%),
    radial-gradient(4% 60% at 22% 0%, rgba(var(--light), 0.07), transparent 100%),
    radial-gradient(4% 60% at 78% 0%, rgba(var(--light), 0.07), transparent 100%),
    linear-gradient(to bottom, transparent, rgba(var(--light), 0.03) 3%, transparent 50%);
}

.floor::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("/hero/floor_wet.webp") center top / cover no-repeat;
  mask-image:
    radial-gradient(26% 60% at 22% 0%, #000, transparent),
    radial-gradient(26% 60% at 78% 0%, #000, transparent),
    radial-gradient(42% 40% at 50% 0%, #000, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .beam {
    animation: none;
  }
}
</style>
