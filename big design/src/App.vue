<template>

  <section class="header">
        <nav class="navbar">
            <div class="logo">BigDesign</div>
            <ul class="nav-links">
                <li><a href="#student_work_section">Роботи учнів</a></li>
                <li><a href="#">Тарифи</a></li>
                <li><a href="#">Наши курсы</a></li>
                <li><a href="#">Зворотній зв'язок</a></li>
            </ul>
            <button class="register-btn">Реєстрація</button>
        </nav>
        <div class = "header-info ">
            <h1 class="main-title">Здесь не Ctrl+V.<br> Здесь Ctrl+Творчество.</h1>
            <p class="subtext">Не учим рисовать.
Учим создавать себя через искусство.</p>
        </div>
  </section>
  <section class="student_work_section" id="student_work_section">
       <h2 class="text_student_work">Галерея лучших работ </h2> 
        
        <swiper
          autoHeight = "true"
          :navigation="true"
          :modules="modules"
          :slides-per-view="3.2"
          :space-between="30"
          :loop="true"
          class="mySwiper"
        >
        
        
          <swiper-slide class="swiper-wrapper">
            <div class="swiper-slide-content">
              <div>
              <video src="./assets/video.mp4" controls width="100%" loop preload="metadata"  class="swiper-video-preview"></video>
              </div>
              <!-- poster="./assets/HeaderImg.avif" -->
              <div class="swiper-slide-text">
                <img src="./assets/student_photo.jpg" alt="photo of students" width="100" height="100" > 
                <div class="swiper-text-block">
                  <h3>Илья Садовский</h3>
                  <p style="font-size: small;">До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий. Я не знал, как правильно что-то делать. Если бы я продолжал слушать советы от случайных комментаторов, у меня бы ничего не получилось...</p>
                  <button type="button" class="button-reveal">Раскрить</button>
                </div>
              </div>
            </div>
          </swiper-slide>
          <swiper-slide class="swiper-wrapper">
            <div class="swiper-slide-content">
              <div>
              <video src="./assets/video.mp4" controls width="100%" loop preload="metadata"  class="swiper-video-preview"></video>
              </div>
              <!-- poster="./assets/HeaderImg.avif" -->
              <div class="swiper-slide-text">
                <img src="./assets/student_photo.jpg" alt="photo of students" width="100" height="100" > 
                <div class="swiper-text-block">
                  <h3>Илья Садовский</h3>
                  <p style="font-size: small;">До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий. Я не знал, как правильно что-то делать. Если бы я продолжал слушать советы от случайных комментаторов, у меня бы ничего не получилось...</p>
                  <button type="button" class="button-reveal">Раскрить</button>
                </div>
              </div>
            </div>
          </swiper-slide>
          <swiper-slide class="swiper-wrapper">
            <div class="swiper-slide-content">
              <div>
              <video src="./assets/video.mp4" controls width="100%" loop preload="metadata"  class="swiper-video-preview"></video>
              </div>
              <!-- poster="./assets/HeaderImg.avif" -->
              <div class="swiper-slide-text">
                <img src="./assets/student_photo.jpg" alt="photo of students" width="100" height="100" > 
                <div class="swiper-text-block">
                  <h3>Илья Садовский</h3>
                  <p style="font-size: small;">До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий. Я не знал, как правильно что-то делать. Если бы я продолжал слушать советы от случайных комментаторов, у меня бы ничего не получилось...</p>
                  <button type="button" class="button-reveal">Раскрить</button>
                </div>
              </div>
            </div>
          </swiper-slide>
          <swiper-slide class="swiper-wrapper">
            <div class="swiper-slide-content">
              <div>
              <video src="./assets/video.mp4" controls width="100%" loop preload="metadata"  class="swiper-video-preview"></video>
              </div>
              <!-- poster="./assets/HeaderImg.avif" -->
              <div class="swiper-slide-text">
                <img src="./assets/student_photo.jpg" alt="photo of students" width="100" height="100" > 
                <div class="swiper-text-block">
                  <h3>Илья Садовский</h3>
                  <p style="font-size: small;">До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий. Я не знал, как правильно что-то делать. Если бы я продолжал слушать советы от случайных комментаторов, у меня бы ничего не получилось...</p>
                  <button type="button" class="button-reveal">Раскрить</button>
                </div>
              </div>
            </div>
          </swiper-slide>
          <swiper-slide class="swiper-wrapper">
            <div class="swiper-slide-content">
              <div>
              <video src="./assets/video.mp4" controls width="100%" loop preload="metadata"  class="swiper-video-preview"></video>
              </div>
              <!-- poster="./assets/HeaderImg.avif" -->
              <div class="swiper-slide-text">
                <img src="./assets/student_photo.jpg" alt="photo of students" width="100" height="100" > 
                <div class="swiper-text-block">
                  <h3>Илья Садовский</h3>
                  <p style="font-size: small;">До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий. Я не знал, как правильно что-то делать. Если бы я продолжал слушать советы от случайных комментаторов, у меня бы ничего не получилось...</p>
                  <button type="button" class="button-reveal">Раскрить</button>
                </div>
              </div>
            </div>
          </swiper-slide>
          <swiper-slide class="swiper-wrapper">
            <div class="swiper-slide-content">
              <div>
              <video src="./assets/video.mp4" controls width="100%" loop preload="metadata"  class="swiper-video-preview"></video>
              </div>
              <!-- poster="./assets/HeaderImg.avif" -->
              <div class="swiper-slide-text">
                <img src="./assets/student_photo.jpg" alt="photo of students" width="100" height="100" > 
                <div class="swiper-text-block">
                  <h3>Илья Садовский</h3>
                  <p style="font-size: small;">До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий. Я не знал, как правильно что-то делать. Если бы я продолжал слушать советы от случайных комментаторов, у меня бы ничего не получилось...</p>
                  <button type="button" class="button-reveal">Раскрить</button>
                </div>
              </div>
            </div>
          </swiper-slide>
          
        </swiper>
    
  </section>
  <section class="before_after_slider_block">
  <h2 class="text_student_work">До/После</h2>
  <div
    class="before_after_slider"
    ref="slider"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div
      class="slider_before"
      :style="{ width: beforeWidth + '%' }"
    >
      <div
        class="slider_resize"
        @mousedown.stop.prevent="startDrag"
        @touchstart.stop.prevent="startDrag"
      >
      </div>
    </div>
      <div class="slider_after"></div>
    </div>
  </section>
  <section class="our_product_bloc">
    <p>Наши курси</p>
    <div class="our_product">
      <div  class="our_product_item">
        <img src="" alt="">
        <span>
          <h3>Курс 1</h3>
          <button type="button"></button>
        </span>
        <div>
         <p></p>
         <p></p>
         <p></p>
         <p></p>
        </div>
        <div class="our_product_futer_button">
          <button type="button"></button>
          <button type="button"></button>
        </div>
      </div>
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
      heroBackground: `url(${heroBg})`,
      beforeWidth: 50,
      dragging: false,
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

    // Drag logic for before/after slider
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('touchmove', this.onDrag);
    window.addEventListener('touchend', this.stopDrag);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('touchmove', this.onDrag);
    window.removeEventListener('touchend', this.stopDrag);
  },
  methods: {
    startDrag(e) {
      this.dragging = true;
      this.onDrag(e);
    },
    stopDrag() {
      this.dragging = false;
    },
    onDrag(e) {
      if (!this.dragging) return;
      let clientX;
      if (e.touches && e.touches.length) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }
      const slider = this.$refs.slider;
      const rect = slider.getBoundingClientRect();
      let percent = ((clientX - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      this.beforeWidth = percent;
    },
  },
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
    margin-left: 10%;
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
  font-weight: lighter;
  justify-content: left;


}
 .swiper {
  width: 100%;
  height: 700px;
  display: flex;
  justify-content: flex-end; 

}
.swiper-wrapper {
  /* width: 100%; */
  height: 100%;
  text-align: center;
  font-size: 25px;

  display: flex;
  justify-content: center;
  align-items: center;
  filter: blur(0);
  /* opacity: 0.6; */
  transition: filter 0.5s ease, opacity 0.5s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

}

.swiper-slide-content{
   align-items: flex-start;
   /* background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); */
   /* background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); */
   /* background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); */
   background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
   /* background: linear-gradient(135deg, #2c2f33 0%, #23272a 100%); */


  border-radius: 10%;

}
.swiper-video-preview{
  object-fit: cover;
  border-radius: 5%;
}

.swiper-slide img {
  border-radius: 10%;
  width: 130px;
  height: 130px;
  object-fit: cover;
  margin-left: 5%;
  margin-top: 2%;
}
.swiper-slide-text{
  margin-top: 2%;
  display: flex;
  flex-direction: row;
  /* align-items: center; */
  justify-content: right;
  text-align: left;
  gap: 20px;
}
.swiper-text-block{
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #cfd9f5; /* світлий текст */
  padding: 16px;
  border-radius: 8px;
  max-width: 400px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  
}
.swiper-text-block h3 {
  /* line-height: 0.5; */
  font-size:larger;   
  margin: 0;

  font-weight: bold;
  color: white;
}
.swiper-text-block p {
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}
.button-reveal {
  background-color: #1f66c1;      
  color: #ffffff;
  padding: 10px 26px;             
  border: none;
  border-radius: 24px;            
  font-size: 13px;                
  font-family: 'Segoe UI', sans-serif;
  font-weight: 600;               
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button-reveal:hover {
  background-color: #3783e0;      
}


:deep(.swiper-button-next){
  right: 45%; 

}
:deep(.swiper-button-prev) {
 left: 35%;
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
 
 top: 4%;
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



.before_after_slider_block {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.before_after_slider {
  width: 1024px;
  height: 512px;
  position: relative;
  /* background: lightcoral; */
}
.slider_before {
  width: 50%;
    height: 100%;
    position: absolute;
    z-index: 2;
    background: url('./assets/before_after_img/after.png') no-repeat center center fixed;
    background-size: cover;
}
.slider_after {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  background: url('./assets/before_after_img/before.png') no-repeat center center fixed;
  background-size: cover;
}
.slider_resize {
  width: 5px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  cursor: ew-resize;
  background: rgba(255, 255, 255, 0.5);
  z-index: 10;
  /* стрелки будут псевдоэлементами */
}

.slider_resize::before,
.slider_resize::after {
  position: absolute;
  color: wheat;
  font-size: 30px;
  font-weight: 900;
  user-select: none;
  pointer-events: none;
  line-height: 1;
}

.slider_resize::before {

  content: '<';
  right: 20px;
  top: 50%;
}

.slider_resize::after {
  content: '>';
  left: 20px;
  top: 50%;
}

.our_product_bloc{

}

</style>



















