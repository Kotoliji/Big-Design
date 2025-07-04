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
            <p class="subtext">Наша миссия — раскрыть потенциал молодых художников, обучая современным CGI-технологиям.  
  Мы объединяем комьюніті, которого раньше не существовало.</p>
        </div>
  </section>
  <div class="student_work_section" id="student_work_section">
  <h2>Роботи наших випускників!</h2>      
        <swiper :navigation="true" :modules="modules"  :slides-per-view="1.2"
        centered-slides 
        loop
        autoHeight = "true"
        space-between="60"
        class="mySwiper">
          <swiper-slide><img src="./assets/tech_model.jpg" alt="kids do this model " width="360" height="300"></swiper-slide>
          <swiper-slide><img src="./assets/tech_model.jpg" alt="kids do this model " width="360" height="300"></swiper-slide>
          <swiper-slide><img src="./assets/tech_model.jpg" alt="kids do this model " width="360" height="300"></swiper-slide>
          <swiper-slide><img src="./assets/tech_model.jpg" alt="kids do this model " width="360" height="300"></swiper-slide>
          <swiper-slide><img src="./assets/tech_model.jpg" alt="kids do this model " width="360" height="300"></swiper-slide>
        </swiper>
  </div>
  
</template>

<script>
import heroBg from './assets/HeaderImg.avif'

export default {
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
  }
}

import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libertinus+Mono&display=swap');
.header {
    width: 1440px;
    height: 100vh;
    background-image: 
        linear-gradient(to bottom, 
            rgba(0,0,0,0) 0%, 
            rgba(0,0,0,0) 50%, 
            rgba(0,0,0,0.3) 70%, 
            rgba(0,0,0,0.8) 85%, 
            rgba(0,0,0,1) 100%),
        url('https://img.pikbest.com/wp/202347/twitch-logo-social-media-3d-background-design-with_9746465.jpg!w700wp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content:space-between;
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
  background: rgba(0, 0, 0, 0.3); /* Было 0.8, стало 0.3, чтобы фон не перекрывался */
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
.student_work_section h2 {

  font-size: 2.5rem;
  margin-bottom: 20px;
  /* font-family: "Libertinus Mono", monospace;  ////////////////*/
  font-weight: lighter;
}
 .swiper {
  width: 100%;
  height: 90vh;
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
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swiper-slide-active {
  filter: blur(0);
  opacity: 1;
}

:deep(.swiper-button-next){
 right:10%;
}
:deep(.swiper-button-prev) {
 left: 10%;
}
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
 /* left: 10%; */
 background-color: transparent;
 border-radius: 50%;
 border: 3px solid #65168d;
 width: 48px;
 height: 48px;
 color: #65168d;
 font-weight: bold;
 box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
 transition: all 0.3s ease;
 
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



</style>






















<!-- <template>
  <h3>{{ header }}</h3>
  <p > {{ someInfo }}</p>
  
  <button type="button" @click="showUserInfo()"> Показать пользовательскую инфу </button>
  <button type="button" @click="userUp()" >Отправить</button>
  <input type="text" v-model="userText" placeholder="Текст">
  <input type="name" v-model="userName" placeholder="Ім'я">
  <input type="pasword" v-model="userPasword" placeholder="Пароль">
  <User v-for="(el, index) in userInfo" :user = "el" :index = "index" :deleteUser ="deleteUser"/>
  <div v-if="userInfo.length == 0">
    NON
  </div>         

  <div v-else-if="userInfo.length == 1">
    Only 1
  </div>     
  <div v-else>
    More 1
  </div>    
</template>
            -->


<!-- <style scoped>
h3{
    color: rgb(78, 3, 43);
}
</style> -->
<!-- <script >
import User from './components/User.vue';
    export default{
        components:{User},
        data(){
            return{
                userInfo:[],
                header:"hello worldDDDDDDDDD",
                someInfo:"info",
                userText:"",
                userName:"",
                userPasword:""
            }
        },
        methods:{
            userUp(word='Nex text'){
               this.someInfo = word;
            },
            showUserInfo(){
                this.userInfo.push({
                    name: this.userName,
                    pass: this.userPasword,
                    text: this.userText
                })

            },
            deleteUser(index){
                this.userInfo.splice(index, 1);
            }
        }
    }
</script> -->
