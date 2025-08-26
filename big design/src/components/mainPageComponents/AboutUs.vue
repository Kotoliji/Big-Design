<template>
  <section class="intro">
    <div class="container">
      <div class="grid">
        <!-- ЛЕВАЯ КОЛОНКА: копирайт -->
        <div class="copy">
          <div class="accent" aria-hidden="true"></div>
          <h2 class="title">
            BigDesign — это не просто школа.
            <br />Это платформа для роста 3D‑Артистов, Моушн‑Дизайнеров и Творческих людей.
          </h2>
          <p class="lead">Мы объединяем обучение, комьюнити, вызовы и развитие в одной экосистеме. Здесь ты не просто
            осваиваешь софт — ты формируешь взгляд, стиль и мышление арт‑директора.</p>
        </div>

        <!-- ПРАВАЯ КОЛОНКА: видео + 2D‑текст -->
        <div class="media">
          <div class="video-wrap">
            <video ref="vid" :src="videoSrc" muted playsinline loop preload="metadata"></video>
          </div>


        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'IntroBlock',
  props: {
    // Положи файл в public/intro/16_08.mp4 или передай свой путь сюда
    src: { type: String, default: '/description_video/16_08.mp4' }
  },
  computed: {
    videoSrc() { return this.src }
  },
  mounted() {
    // Автовоспроизведение только когда блок в зоне видимости
    const v = this.$refs.vid
    if (!v) return
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) v.play().catch(() => { })
        else v.pause()
      }
    }, { threshold: 0.25 })
    io.observe(v)
    this._io = io
  },
  unmounted() { this._io && this._io.disconnect() }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jura:wght@300..700&display=swap');

/* Сдержанная эстетика */
.intro {
  background: transparent;
  color: #e8e8e8;
  position: relative;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 48px 16px;
}

.grid {
  display: grid;
  grid-template-columns: minmax(320px, 560px) 1fr;
  gap: clamp(16px, 3vw, 32px);
  align-items: center;
}

.copy {
  font-family: 'Jura', system-ui, sans-serif;
  position: static;
  max-width: min(720px, 48vw);
  z-index: 2;
}

.title {
  margin: 14px 0 0;
  font-weight: 700;
  font-size: clamp(28px, 4.6vw, 56px);
  line-height: 1.12;
  letter-spacing: .01em;
}

/* Тонкий «заряд»‑акцент */
.accent {
  width: 84px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #2ee6ff, #7af0c1 55%, #2ee6ff);
  filter: drop-shadow(0 0 8px rgba(46, 230, 255, .35));
  animation: pulse 2.8s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: .55
  }

  50% {
    opacity: 1
  }
}

/* Мягкое смешение видео с фоном слева */
/* gradient removed per request */

.media {
  position: relative;
  width: 100%;
  margin: 0;
  z-index: 1;
}

.video-wrap {
  position: relative;
  overflow: visible;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  outline: none;
  height: var(--introVideoH, min(82vh, 900px));
}

.video-wrap video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
}

/* 2D‑текст рядом (оверлей на десктопе) */


/* Адаптив */
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .copy {
    max-width: none;
  }

  .media {
    width: 100%;
    margin: 0;
  }

  .video-wrap {
    height: auto;
  }

  .video-wrap video {
    height: auto;
    max-height: 70vh;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 28px 14px;
  }

  .title {
    font-size: clamp(22px, 7vw, 30px);
  }

  .lead {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .accent {
    animation: none
  }
}
</style>
