<template>
  <section class="header">
    <div>
      <video autoplay muted loop playsinline class="bg-video">
        <source src="./assets/screen.mp4" type="video/mp4" />
      </video>
    </div>
    <nav class="navbar">
      <div class="logo">BigDesign</div>
      <ul class="nav-links">
        <li><a href="#student_work_section">Работы учеников</a></li>
        <li><a href="#personal_account">Клуб</a></li>
        <li><a href="#Review">Отзывы</a></li>
      </ul>
      <button class="register-btn" onclick="window.location.href='https://t.me/nebudetgg'">
        Присоединиться
      </button>
    </nav>
    <!-- <div class="header-info">
      <h1 class="main-title">Здесь не Ctrl+V.<br> Здесь Ctrl+Творчество.</h1>
      <p class="subtext">Не учим рисовать. Учим создавать себя через искусство.</p>
    </div> -->
  </section>
  <AboutUs />
  <GalleryOfWorks />
  <BeforeAfterSlider />
  <Club />
  <div class="center-video-block">
    <video src="/video_with_instraction/Video_present.mp4" class="center-video" controls
      style="background:#222;"></video>
  </div>
  <Review />

</template>

<script>
// import Registration from "./components/registration.vue";
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
    //Registration,
    AboutUs,
    Club,
  },
  data() {
    return {
      heroBackground: `url(${heroBg})`,
    };
  },
  mounted() {
    // scroll logic
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  },
};
</script>

<style scoped>
.center-video-block {

  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 32px 0 48px 0;
  /* padding: 24px 16px; */
}

.center-video {
  margin-top: 15px;
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

/* Адаптив */
@media (max-width: 900px) {
  .center-video {
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
</style>
