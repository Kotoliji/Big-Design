<template>

  <section class="header">
        <nav class="navbar">
            <div class="logo">BigDesign</div>
            <ul class="nav-links">
                <li><a href="#student_work_section">Роботи учнів</a></li>
                <li><a href="#">Тарифи</a></li>
                <li><a href="#">Етапи навчання</a></li>
                <li><a href="#">Зворотній зв'язок</a></li>
            </ul>
            <button class="register-btn">Реєстрація</button>
        </nav>
        <div class = "header-info ">
            <h1 class="main-title">BigDesign<br>первая VFX/CGI-платформа в СНГ</h1>
            <p class="subtext">Не учим рисовать.
Учим создавать себя через искусство.</p>
        </div>
  </section>
  <section class="student_work_section" id="student_work_section">
  <h2 class="text_student_work">Галерея лучших работ </h2>      
        <swiper :navigation="true" :modules="modules"  :slides-per-view="1.2"
        centered-slides 
        loop
        autoHeight = "true"
        space-between="60"
        class="mySwiper">
        
          <swiper-slide><img src="./assets/studentsWork/Untitled (5).png" alt="kids do this model " width="360" height="200"></swiper-slide>
          <swiper-slide><img src="./assets/studentsWork/Untitled (1).png" alt="kids do this model " width="360" height="200"></swiper-slide>
          <swiper-slide><img src="./assets/studentsWork/Untitled (2).png" alt="kids do this model " width="360" height="200"></swiper-slide>
          <swiper-slide><img src="./assets/studentsWork/Untitled (3).png" alt="kids do this model " width="360" height="200"></swiper-slide>
          
        </swiper>
    
  </section>
  <!-- before/after slider section -->
  <section class="before_after_slider">
    <h2 class="text_student_work">До/После</h2>
    <div class="before-after-container">
      <div class="before-img">
        <img src="./assets/before_after_img/before.png" alt="До" />
        <span class="label">До</span>
      </div>
      <div class="after-img">
        <img src="./assets/before_after_img/after.png" alt="После" />
        <span class="label">После</span>
      </div>
      <div class="slider-bar" id="sliderBar"></div>
    </div>
  </section>
</template>

<script>
import heroBg from './assets/HeaderImg.avif'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default {
  name: 'app',
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {
      modules: [Navigation],
    };
  },
  data() {
    return {
      heroBackground: `url(${heroBg})`
    }
  },
  mounted() {
    // before/after slider logic
    const container = document.querySelector('.before-after-container');
    const afterImg = container.querySelector('.after-img');
    const slider = container.querySelector('.slider-bar');
    let isDragging = false;
    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      document.body.style.userSelect = 'none';
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      document.body.style.userSelect = '';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const rect = container.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      offsetX = Math.max(0, Math.min(offsetX, rect.width));
      const percent = (offsetX / rect.width) * 100;
      afterImg.style.width = percent + '%';
      slider.style.left = percent + '%';
    });
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
    width: 100%;
    height: 100vh;
    background-image: 
        linear-gradient(to bottom, 
            rgba(0,0,0,0) 0%, 
            rgba(0,0,0,0) 50%, 
            rgba(0,0,0,0.3) 70%, 
            rgba(0,0,0,0.8) 85%, 
            rgba(0,0,0,1) 100%),
        url('./assets/header_bac.png');
        
    background-size: cover;
    background-position:right;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content:space-around;
}
.navbar {
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position:fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  padding:15px 5px;
  color: white;
}
.navbar:hover{
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
  /* text-decoration: none; */
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
.student_work_section {
    color: aliceblue;
    background-color: #000;
    padding: 100px 20px;
    text-align: center;
}
.text_student_work{
  display: flex;
  font-family: "Libertinus Mono", monospace;
  font-size: 2.5rem;
  margin-bottom: 40px;
  margin-left: 10%;
  font-weight: lighter;


}
 .swiper {
  width: 100%;
  display: flex;
 
  justify-content: flex-end; 
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #444;
  display: flex;
  justify-content: center;
  align-items: center;
  
  filter: blur(6px);
  opacity: 0.6;
  transition: filter 0.5s ease, opacity 0.5s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.swiper-slide img {
  
  width: 500%;
  height: 500px;
  object-fit: cover;
}

.swiper-slide-active {
  filter: blur(0);
  opacity: 1;
}

:deep(.swiper-button-next){
  right: 20%; 

}
:deep(.swiper-button-prev) {
 left: 70%;
}
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
 background-color: transparent;
 border-radius: 50%;
 border: 3px solid #ffffff;
 width: 48px;
 height: 48px;
 color: #ffffff;
 font-weight: bold;
 box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
 transition: all 0.3s ease;
 
 top: 5%;
}

 :deep(.swiper-button-next::after),
 :deep(.swiper-button-prev::after) {
  font-size: 20px;
}

:deep(.swiper-button-next:hover){
  transform: translateX(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
:deep(.swiper-button-prev:hover){
  transform: translateX(2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.before-after-container {
  position: relative;
  width: 600px;
  max-width: 90vw;
  height: 350px;
  margin: 40px auto 0 auto;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
}
.before-after-container .before-img,
.before-after-container .after-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  overflow: hidden;
}
.before-after-container .before-img img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(0.7);
}
.before-after-container .after-img {
  width: 50%;
  clip-path: inset(0 0 0 0); /* Показываем только половину */
  z-index: 2;
}
.before-after-container .after-img img {
  width: 100%; height: 100%; object-fit: cover;
}
.before-after-container .slider-bar {
  position: absolute;
  left: 50%;
  top: 0;
  width: 4px;
  height: 100%;
  background: #fff;
  z-index: 3;
  cursor: ew-resize;
  border-radius: 2px;
  box-shadow: 0 0 8px #fff;
  transition: background 0.2s;
}
.before-after-container .label {
  position: absolute;
  top: 10px;
  left: 20px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 1rem;
  z-index: 4;
}
.before-after-container .after-img .label {
  left: auto;
  right: 20px;
}
</style>



















