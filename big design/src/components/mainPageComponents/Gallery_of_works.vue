<template>
  <section class="student_work_section" id="student_work_section">
    <div class="section-title">
        <h2 class="text_student_work">Галерея лучших работ</h2>
    </div>
    <swiper
      autoHeight="true"
      :navigation="true"
      :modules="modules"
      :slides-per-view="3.2"
      :space-between="30"
      :loop="true"
      class="mySwiper"
    >
      <swiper-slide
        v-for="(student, idx) in students"
        :key="idx"
        class="swiper-wrapper"
      >
        <div class="swiper-slide-content">
          <div>
            <video :src="student.video" controls width="100%" loop preload="metadata" class="swiper-video-preview"></video>
          </div>
          <div class="swiper-slide-text">
            <img :src="student.photo" :alt="`photo of ${student.name}`" width="100" height="100">
            <div class="swiper-text-block">
              <h3>{{ student.name }}</h3>
              <p style="font-size: small;">{{ student.short }}</p>
              <button type="button" class="button-reveal" @click="openModal(idx)">Раскрить</button>
            </div>
          </div>
        </div>
      </swiper-slide>
      
    </swiper>
   <div v-if="activeStudent !== null" class="student-modal-overlay" @click.self="closeModal">
  <div class="student-modal">
    <div class="modal-left-block">
      <div class="modal-header-row">
        <img :src="students[activeStudent].photo" alt="student avatar" class="modal-avatar" />
        <div>
          <h2 class="modal-name">{{ students[activeStudent].name }}</h2>
          <div class="modal-username">@{{ students[activeStudent].username }}</div>
        </div>
      </div>
      <div class="modal-body">
        <p class="modal-about">{{ students[activeStudent].about }}</p>
        <div class="modal-experience">
          <div>
            <strong>Опыт до обучения</strong>
            <div>{{ students[activeStudent].before }}</div>
          </div>
          <div>
            <strong>После обучения</strong>
            <div>{{ students[activeStudent].after }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-content-right">
      <div class="modal-video">
        <video :src="students[activeStudent].video" controls width="100%" loop preload="metadata"></video>
      </div>
    </div>
    <button class="modal-close-btn" @click="closeModal">×</button>
  </div>
</div>
  </section>
</template>


<script>
// Импорты, необходимые для Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination  } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default {
  name: 'GalleryOfWorks',
  components: { Swiper, SwiperSlide },
  data() {
    return {
      modules: [Navigation],
      activeStudent: null,
      students: [
        {
          name: 'Илья Садовский',
          username: 'ilya_sadovskiy',
          photo: new URL('../../assets/student_photo.jpg', import.meta.url).href,
          video: new URL('../../assets/video.mp4', import.meta.url).href,
    
          short: 'До этого я проходил бесплатные уроки на YouTube, но они не давали мне чёткого понимания и пошагового плана действий...',
          about: 'Вы нередко можете увидеть новости о том, что кто-то создал очередной ремейк нашумевшей игры или топового сериала на Unreal Engine 5. Кто знает, может это буду я или ребята с моего потока. Если эта сфера интересна тебе, не откладывай этот момент и залетай на новые потоки. Исходя из собственного опыта, могу точно сказать, что практически любая идея, которая возникнет у тебя в голове, может реализоваться именно в Unreal Engine.',
          before: 'Когда пришел в Мастерскую, не имел никакого опыта в 3D. Прошел буткемп Моушн.',
          after: 'С еще одним учеником Мастерской основали продакшн. Работают над заказами из США, занимались графикой для короткометражного фильма Photon. Создали свою игру.'
        },
        {
         name: 'Александр Петров',
          username: 'alex_petrov',
          photo: new URL('../../assets/student_photo.jpg', import.meta.url).href,
          video: new URL('../../assets/video.mp4', import.meta.url).href,
          short: 'Я пришел в Мастерскую с нулевым опытом в 3D, но уже через несколько месяцев смог создать свой первый проект.',
          about: 'Мастерская дала мне четкую структуру обучения и поддержку сообщества. Я научился создавать качественные 3D-модели и анимации, которые теперь использую в своих проектах.',
          before: 'До обучения я работал в другой сфере и не имел опыта в 3D.',
          after: 'После обучения я начал работать фрилансером и уже получил несколько заказов на создание 3D-моделей.'
        },
        {
          name: 'Мария Иванова',
          username: 'maria_ivanova',
          photo: new URL('../../assets/student_photo.jpg', import.meta.url).href,
          video: new URL('../../assets/video.mp4', import.meta.url).href,  
          short: 'Я всегда мечтала заниматься 3D-графикой, но не знала, с чего начать. Мастерская помогла мне найти свой путь.',
          about: 'Благодаря курсам я научилась работать в Blender и Unreal Engine. Теперь я могу создавать свои собственные проекты и даже начала работать над заказами для клиентов.',
          before: 'До обучения я была дизайнером интерьеров и не имела опыта в 3D.',
          after: 'После обучения я начала работать в команде над созданием 3D моделей для игр и анимаций. Это стало моим новым увлечением и источником дохода.'
        },
        {
          name: 'Дмитрий Смирнов',
          username: 'dmitry_smirnov',
          photo: new URL('../../assets/student_photo.jpg', import.meta.url).href,
          video: new URL('../../assets/video.mp4', import.meta.url).href,
          short: 'Я пришел в Мастерскую с опытом в 2D-дизайне, но хотел расширить свои навыки и научиться работать в 3D.',
          about: 'Курсы помогли мне освоить Blender и Unreal Engine. Я научился создавать качественные 3D-модели и анимации, которые теперь использую в своих проектах.',
          before: 'До обучения я работал графическим дизайнером и не имел опыта в 3D.',
          after: 'После обучения я начал работать фрилансером и уже получил несколько заказов на создание 3D-моделей.'
        },
        {
          name: 'Мария Иванова',
          username: 'maria_ivanova',
          photo: new URL('../../assets/student_photo.jpg', import.meta.url).href,
          video: new URL('../../assets/video.mp4', import.meta.url).href,  
          short: 'Я всегда мечтала заниматься 3D-графикой, но не знала, с чего начать. Мастерская помогла мне найти свой путь.',
          about: 'Благодаря курсам я научилась работать в Blender и Unreal Engine. Теперь я могу создавать свои собственные проекты и даже начала работать над заказами для клиентов.',
          before: 'До обучения я была дизайнером интерьеров и не имела опыта в 3D.',
          after: 'После обучения я начала работать в команде над созданием 3D моделей для игр и анимаций. Это стало моим новым увлечением и источником дохода.'
        },
        
      ]
    }
  },
  methods: {
    openModal(idx) { this.activeStudent = idx },
    closeModal() { this.activeStudent = null }
  }
}
</script>


<style>
.student_work_section {
    margin-left: 10%;
    color: aliceblue;
    background-color: #000;
    padding: 100px 20px;
    /* text-align: center; */
}



.section-title {
  align-self:flex-start; 
    display: inline-block;
    
  border-width: 0px;
    border-radius: 3000px 3000px 3000px 3000px;
    background-image: linear-gradient(0.488turn, rgba(97, 68, 117, 0.44) 0%, rgba(255, 255, 255, 0) 100%);
    border-color: transparent;
    border-style: solid;
    margin-bottom: 40px;
    justify-content: left;
}
.text_student_work {
    /* display: inline-block; */
    padding: 0.75rem 2rem;
    background-image: linear-gradient(0.488turn, rgba(97, 68, 117, 0.44) 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 3000px 3000px 3000px 3000px;
  vertical-align: middle;
    color: #f8f8f8;
    font-size:2.5rem;
    font-family: 'Arial', Arial, sans-serif;
    line-height: 1;
    font-weight: 600;
    letter-spacing: -1.5px;
    background-position: center center;
    border-color: transparent;
    border-style: solid;
    
    text-align: left;
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

.swiper-button-next{
  right: 45%; 

}
.swiper-button-prev {
 left: 35%;
}
.swiper-button-next,
.swiper-button-prev {
 display: none !important;


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

.swiper-button-next::after,
.swiper-button-prev::after {
  font-size: 20px;
}

.swiper-button-next:hover{
  transform: translateX(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
.swiper-button-prev:hover{
  transform: translateX(2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
.student-modal-overlay {
  position: fixed;
  z-index: 2000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(30, 41, 59, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}


@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(40px);}
  to { opacity: 1; transform: none;}
}

.student-modal {
  background: #16213e;
  color: #fff;
  border-radius: 28px;
  max-width: 1300px;
  width: 96vw;
  padding: 48px 48px 48px 48px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.28);
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 48px;
  animation: modalFadeIn 0.4s;
  align-items: stretch;
}

.modal-left-block {
  flex: 1.6;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.modal-header-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  margin-bottom: 18px;
}

.modal-avatar {
  width: 90px;
  height: 90px;
  border-radius: 18px;
  object-fit: cover;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
}

.modal-name {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #fff;
  letter-spacing: 0.5px;
}

.modal-username {
  color: #b5c7e6;
  font-size: 1.1rem;
  margin-bottom: 0;
  opacity: 0.85;
}

.modal-body {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modal-about {
  font-size: 1.18rem;
  color: #e0e7ef;
  margin-bottom: 0;
  white-space: pre-line;
  font-family: 'JetBrains Mono', 'Fira Mono', 'Consolas', monospace;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.modal-experience {
  display: flex;
  gap: 24px;
  margin: 0 0 8px 0;
}

.modal-experience > div {
  background: rgba(23, 32, 51, 0.98);
  border-radius: 16px;
  padding: 18px 22px;
  min-width: 260px;
  font-size: 1.08rem;
  color: #e0e7ef;
  border: 1.5px solid #2e3c54;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
}

.modal-experience > div strong {
  font-size: 1.08rem;
  color: #fff;
  margin-bottom: 6px;
  display: block;
  font-family: 'Segoe UI Semibold', 'Segoe UI', Arial, sans-serif;
}

.modal-content-right {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-video {
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-video video {
  width: 100%;
  border-radius: 18px;
  background: #000;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
}

.modal-close-btn {
  position: absolute;
  top: 24px;
  right: 32px;
  background: none;
  border: none;
  color: #b5c7e6;
  font-size: 2.2rem;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
}
.modal-close-btn:hover {
  color: #fff;
}
</style>