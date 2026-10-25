<template>
  <section class="header">
    <div>
      <video ref="bgVideo" v-if="shouldLoadBgVideo" autoplay muted loop playsinline class="bg-video"
        @loadstart="onBgVideoLoadStart" @canplay="onBgVideoCanPlay">
        <source :src="isMobile ? '/header_scren/scren_less770px.mp4' : '/header_scren/screen.mp4'" type="video/mp4" />
      </video>
      <div v-else class="bg-video-placeholder"></div>
    </div>
    <nav class="navbar">
      <div class="logo">BigDesign</div>
      <ul class="nav-links">
        <li><a href="#student_work_section">Работы учеников</a></li>
        <li><a href="#cg_arena">CG Arena</a></li>
        <li><a href="#Review">Отзывы</a></li>
      </ul>
      <button class="register-btn" onclick="window.location.href='https://web.tribute.tg/s/Alp'">
        Присоединиться
      </button>
    </nav>
  </section>
  <AboutUs />
  <GalleryOfWorks />

  <img ref="cgArenaImg" v-if="shouldLoadCgArenaImg" src="/cg_arena.png" alt="CG Arena" id="cg_arena"
    class="cg-arena-img" @load="onCgArenaImgLoad" />
  <div v-else class="cg-arena-placeholder"></div>

  <div class="center-video-block">
    <video ref="centerVideo" v-if="shouldLoadCenterVideo" src="/video_with_instraction/Video_Present1.mp4"
      class="center-video" controls poster="/video_with_instraction/scren.jpg" style="background:#222;" preload="none"
      @loadstart="onCenterVideoLoadStart"></video>
    <div v-else class="center-video-placeholder">
      <img src="/video_with_instraction/scren.jpg" alt="Video Preview" class="video-poster-placeholder"
        @click="loadCenterVideo" />
      <div class="play-button" @click="loadCenterVideo">▶</div>
    </div>
  </div>

  <button class="register-btn-ground" onclick="window.location.href='https://web.tribute.tg/s/Alp'">
    Присоединиться
  </button>

  <Review />
</template>

<script>
import Review from "./components/mainPageComponents/Review.vue";
import GalleryOfWorks from "./components/mainPageComponents/Gallery_of_works.vue";
import BeforeAfterSlider from "./components/mainPageComponents/BeforeAfterSlider.vue";
import AboutUs from "./components/mainPageComponents/AboutUs.vue";
import heroBg from "./assets/HeaderImg.avif";
import Club from "./components/mainPageComponents/Club.vue";
import "swiper/css";

export default {
  name: "app",
  components: {
    Review,
    GalleryOfWorks,
    BeforeAfterSlider,
    AboutUs,
    Club,
  },
  data() {
    return {
      isMobile: window.innerWidth < 770,
      shouldLoadBgVideo: false,
      shouldLoadCenterVideo: false,
      shouldLoadCgArenaImg: false,
      observer: null,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.setupScrollListener();
    this.setupIntersectionObserver();

    // Load background video immediately for better UX
    this.shouldLoadBgVideo = true;
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 770;
    },

    setupScrollListener() {
      const navbar = document.querySelector(".navbar");
      window.addEventListener("scroll", () => {
        if (window.scrollY > 10) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      });
    },

    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target;

              if (target.classList.contains('center-video-block') && !this.shouldLoadCenterVideo) {
                // Load center video when it's about to be visible
                setTimeout(() => {
                  this.shouldLoadCenterVideo = true;
                }, 200);
              }

              if (target.classList.contains('cg-arena-placeholder') && !this.shouldLoadCgArenaImg) {
                // Load CG Arena image when it's about to be visible
                this.shouldLoadCgArenaImg = true;
              }
            }
          });
        }, {
          rootMargin: '100px' // Start loading 100px before element comes into view
        });

        // Observe elements after DOM is ready
        this.$nextTick(() => {
          const centerVideoBlock = document.querySelector('.center-video-block');
          const cgArenaPlaceholder = document.querySelector('.cg-arena-placeholder');

          if (centerVideoBlock) {
            this.observer.observe(centerVideoBlock);
          }
          if (cgArenaPlaceholder) {
            this.observer.observe(cgArenaPlaceholder);
          }
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        this.shouldLoadCenterVideo = true;
        this.shouldLoadCgArenaImg = true;
      }
    },

    loadCenterVideo() {
      this.shouldLoadCenterVideo = true;
      this.$nextTick(() => {
        if (this.$refs.centerVideo) {
          this.$refs.centerVideo.play();
        }
      });
    },

    onBgVideoLoadStart() {
      console.log('Background video started loading');
    },

    onBgVideoCanPlay() {
      console.log('Background video can play');
    },

    onCenterVideoLoadStart() {
      console.log('Center video started loading');
    },

    onCgArenaImgLoad() {
      console.log('CG Arena image loaded');
    }
  },
};
</script>

<style scoped>
.center-video-block {

  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  /* padding: 24px 16px; */
}

.center-video {
  /* margin-top: 15px; */
  /* padding: 24px 16px; */
  width: 80vw;
  /* max-width: 100vw; */
  aspect-ratio: 16/9;
  border-radius: 18px;
  /* box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18); */
  background: linear-gradient(rgb(144, 144, 144) 0%, rgb(26, 26, 26) 100%);
  object-fit: cover;
  display: block;
}

.cg-arena-img {
  display: block;
  margin: auto;
  max-width: 420px;
  width: 100%;
  height: auto;
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  object-fit: contain;
}

/* Адаптив */
@media (max-width: 900px) {
  .center-video {
    border-radius: 12px;
  }

  .cg-arena-img {
    max-width: 440px;
    border-radius: 14px;
    margin: 24px auto 14px auto;
  }

  .register-btn-ground {
    font-size: 18px;
    padding: 18px 28px;
    border-radius: 12px;
  }
}

@media (max-width: 600px) {
  .center-video-block {
    margin: 18px 0 24px 0;
    padding: 16px 4px;
  }

  .center-video {
    border-radius: 8px;
  }

  .cg-arena-img {
    max-width: 98vw;
    border-radius: 10px;
    margin: 16px auto 10px auto;
  }

  .register-btn-ground {
    font-size: 16px;
    padding: 14px 10px;
    border-radius: 10px;
    margin-bottom: 18px;
  }
}


/* Основной шрифт для всей страницы */
:global(body) {
  margin: 0;
  overflow-x: hidden;
  font-family: 'Jura', system-ui, sans-serif;
}

/* Основной шрифт для .logo, .navbar, .section-title-text, .register-btn и других важных элементов */
.logo,
.navbar,
.section-title-text,
.register-btn,
.nav-links a {
  font-family: 'Jura', system-ui, sans-serif;
}

/* Второстепенный шрифт для параграфов и описаний */
p,
.subtext,
.about-block,
.review-name {
  font-family: "Libertinus Mono", monospace;
}

:root {
  --header-padding-y: 64px;
}

.header {
  position: relative;
  width: 100%;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: var(--header-padding-y);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100svh;
  object-fit: cover;
  object-position: center;
  z-index: 0;
  pointer-events: none;
}

/* Адаптив для телефонов */
@media (max-width: 768px) {
  .bg-video {
    width: 100vw;
    /* height: 100svh; */
    min-height: 100svh;
    left: 0;
    top: 0;
  }
}

.navbar {
  max-width: 100vw;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(17,
      17,
      17,
      0.25);
  /* легкий фон, чтобы текст читался, без сильного затемнения */
  -webkit-backdrop-filter: saturate(120%) blur(6px);
  backdrop-filter: saturate(120%) blur(6px);
  color: #fff;
  z-index: 999;
  transition: background 0.25s ease, box-shadow 0.25s ease;
}

.navbar.scrolled {
  background: rgba(17, 17, 17, 0.45);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.logo {
  font-weight: 800;
  letter-spacing: 0.2px;
  font-size: 20px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #fff;
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
}

.nav-links a:hover {
  text-decoration: underline;
}

.register-btn {
  background: #fff;
  color: #111;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  cursor: pointer;
}

.register-btn-ground {
  background: #fff;
  color: #111;
  border: none;
  padding: 22px 38px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.2px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  cursor: pointer;
  display: block;
  margin: 0 auto 32px auto;
}

.register-btn-ground:focus {
  outline: 2px solid #000;
  outline-offset: 2px;
}

.register-btn-ground:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
  background: #e0e0e0;
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
  background: #f5f5f5;
}

.header-info {
  position: relative;
  z-index: 1;
  color: #fff;
  padding: 72px 48px;
  text-align: left;
}

.main-title {
  font-size: 48px;
  line-height: 1.1;
  font-weight: 800;
  margin: 0 0 12px;
}

.subtext {
  font-size: 18px;
  max-width: 60ch;
  color: rgba(255, 255, 255, 0.95);
}

.about-block {
  padding: 48px 24px;
}

/* ===== АДАПТИВ ПІД НОУТБУКИ / ПЛАНШЕТИ (≤ 1280px, ≤ 1024px) ===== */
@media (max-width: 1280px) {
  :root {
    --header-padding-y: 72px;
  }

  .navbar {
    padding: 12px 20px;
  }

  .logo {
    font-size: 19px;
  }

  .nav-links {
    gap: 14px;
  }

  .register-btn {
    padding: 9px 14px;
    font-size: 14px;
  }

  .main-title {
    font-size: 42px;
  }

  .subtext {
    font-size: 17px;
  }
}

@media (max-width: 1024px) {
  .navbar {
    padding: 12px 18px;
  }

  .logo {
    font-size: 18px;
  }

  .nav-links a {
    font-size: 14px;
  }

  .main-title {
    font-size: 36px;
  }

  .subtext {
    font-size: 16px;
  }
}

/* ===== АДАПТИВ ПІД ТЕЛЕФОНИ (≤ 768px, ≤ 560px, ≤ 420px) ===== */
@media (max-width: 768px) {

  /* НЕ міняємо структуру, лише розкладаємо елементи у 2 рядки */
  .navbar {
    flex-wrap: wrap;
    row-gap: 8px;
    padding: 10px 12px;
  }

  .logo {
    font-size: 18px;
  }

  /* робимо навігацію горизонтально-прокручуваною, щоб нічого не пропало */
  .nav-links {
    order: 3;
    /* піде нижче кнопки */
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
    padding-bottom: 6px;
    scrollbar-width: thin;
  }

  .nav-links::-webkit-scrollbar {
    height: 6px;
  }

  .nav-links::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.35);
    border-radius: 4px;
  }

  .nav-links a {
    font-size: 14px;
    display: inline-block;
    padding: 6px 2px;
  }

  .register-btn {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 10px;
  }

  .header {
    min-height: 72svh;
  }

  .header-info {
    padding: 56px 16px;
  }

  .main-title {
    font-size: 28px;
  }

  .subtext {
    font-size: 15px;
    max-width: 46ch;
  }

  .about-block {
    padding: 32px 16px;
  }
}

@media (max-width: 560px) {
  .logo {
    font-size: 17px;
  }

  .nav-links {
    gap: 10px;
  }

  .nav-links a {
    font-size: 13.5px;
  }

  .register-btn {
    font-size: 13.5px;
    padding: 7px 11px;
  }

  .main-title {
    font-size: 24px;
  }

  .subtext {
    font-size: 14.5px;
  }
}

@media (max-width: 420px) {
  .logo {
    font-size: 16px;
  }

  .nav-links a {
    font-size: 13px;
  }

  .register-btn {
    font-size: 13px;
    padding: 7px 10px;
  }
}

/* ===== ШИРОКІ ЕКРАНИ (≥ 1440px, ≥ 1680px, ≥ 1920px) ===== */
@media (min-width: 1440px) {
  .navbar {
    padding: 14px 40px;
  }
}

@media (min-width: 1680px) {
  .navbar {
    padding: 16px 56px;
  }
}

@media (min-width: 1920px) {
  /* залишаємо твою початкову композицію без змін */
}

/* ===== Доступність / Системні вподобання ===== */
@media (prefers-reduced-motion: reduce) {
  .register-btn {
    transition: none;
  }
}

@media (prefers-color-scheme: dark) {
  .navbar {
    background: rgba(17, 17, 17, 0.3);
  }
}

@media (prefers-reduced-data: reduce) {
  /* не прибираємо відео повністю, лише вимикаємо auto-play через атрибут, якщо потрібно — це вже у розмітці */
}

/* Placeholder styles */
.bg-video-placeholder {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100svh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  z-index: 0;
}

.center-video-placeholder {
  position: relative;
  width: 80vw;
  aspect-ratio: 16/9;
  border-radius: 18px;
  background: linear-gradient(rgb(144, 144, 144) 0%, rgb(26, 26, 26) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.video-poster-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #111;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.play-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
}

.cg-arena-placeholder {
  display: block;
  margin: auto;
  max-width: 420px;
  width: 100%;
  height: 300px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 50%, #e0e0e0 100%);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Loading states */
.center-video[data-loading] {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Responsive adjustments for placeholders */
@media (max-width: 900px) {
  .center-video-placeholder {
    border-radius: 12px;
  }

  .video-poster-placeholder {
    border-radius: 12px;
  }

  .play-button {
    width: 70px;
    height: 70px;
    font-size: 20px;
  }

  .cg-arena-placeholder {
    max-width: 440px;
    border-radius: 14px;
    margin: 24px auto 14px auto;
    height: 280px;
  }
}

@media (max-width: 600px) {
  .center-video-placeholder {
    border-radius: 8px;
  }

  .video-poster-placeholder {
    border-radius: 8px;
  }

  .play-button {
    width: 60px;
    height: 60px;
    font-size: 18px;
  }

  .cg-arena-placeholder {
    max-width: 98vw;
    border-radius: 10px;
    margin: 16px auto 10px auto;
    height: 200px;
  }
}
</style>
