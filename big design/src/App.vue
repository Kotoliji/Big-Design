<template>
  <section class="header">
    <video autoplay muted loop playsinline class="bg-video">
      <source src="./assets/screen.mp4" type="video/mp4" />
    </video>
    <nav class="navbar">
      <div class="logo">BigDesign</div>
      <ul class="nav-links">
        <li><a href="#student_work_section">Роботи учнів</a></li>
        <li><a href="#personal_account">личний кабинет</a></li>
        <li><a href="#">Наши курсы</a></li>
        <li><a href="#">Зворотній зв'язок</a></li>
      </ul>
      <button class="register-btn">Реєстрація</button>
    </nav>
    <!-- <div class="header-info">
      <h1 class="main-title">Здесь не Ctrl+V.<br> Здесь Ctrl+Творчество.</h1>
      <p class="subtext">Не учим рисовать. Учим создавать себя через искусство.</p>
    </div> -->
  </section>
  <div>
     <p>КТО МИ БЛОК</p>
    </div>
  <GalleryOfWorks />
  <BeforeAfterSlider />
  <Revus />
</template>

<script>
import Registration from './components/registration.vue';
import Revus from './components/mainPageComponents/Revus.vue';  
import GalleryOfWorks from './components/mainPageComponents/Gallery_of_works.vue'
import BeforeAfterSlider from './components/mainPageComponents/BeforeAfterSlider.vue'
import heroBg from './assets/HeaderImg.avif'
import 'swiper/css';

export default {
  name: 'app',
  components: {
    Revus,
    GalleryOfWorks,
    BeforeAfterSlider,
    Registration
  },
  data() {
    return {
      heroBackground: `url(${heroBg})`
    }
  },
  mounted() {
    // scroll logic
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libertinus+Mono&display=swap');
.header {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-self: center;
  margin-top: 100px;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
}
.bg-video {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;

  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  object-position: center;
  /* width: 90%; */
  /* margin-left: 10%; */
  
}
.navbar, .header-info {
  position: relative;
  z-index: 1;
}
.navbar {
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  padding: 15px 5px;
  color: white;
}
.navbar:hover {
  transition: all 0.3s ease;
  background: #111;
}
.scrolled {
  background: #111;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}
.nav-links a {
  color: white;
  font-weight: 500;
}
.nav-links a:hover {
  text-decoration: underline;
}
.register-btn {
  background-color: white;
  color: #111;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}
.register-btn:hover {
  background-color: #f3f3f3;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
.header-info {
  max-width: 700px;
  padding-left: 3rem;
  padding-top: 5rem;
  color: white;
  text-align: left;
}
.main-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}
.subtext {
  font-size: 1.125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  max-width: 600px;
}

</style>