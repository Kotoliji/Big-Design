<template>
  <section class="video-review-slider" id="Review">
    <div class="section-title">
      <h2 class="section-title-text">Работы учеников</h2>
    </div>
    <swiper :space-between="40" :loop="true" :breakpoints="breakpoints" class="carousel">
      <swiper-slide v-for="(review, idx) in reviews" :key="idx">
        <div class="slider-item">
          <video :src="review.video" controls class="review-video" preload="metadata"></video>
          <p class="review-name">{{ review.name }}</p>
        </div>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

const reviews = [
  { video: "/gallery_of_works_review/01.MOV", name: "Наталия" },
  { video: "/gallery_of_works_review/02.MOV", name: "Екатерина" },
  { video: "/gallery_of_works_review/03.MOV", name: "Султан" },
  { video: "/gallery_of_works_review/04.MOV", name: "Борис" },
  { video: "/gallery_of_works_review/06.mp4", name: "Денис" },
  { video: "/gallery_of_works_review/07.MOV", name: "Виталий" },
];

// Адаптивные настройки Swiper
const breakpoints = {
  0: { slidesPerView: 1.5 },      // до 600px
  600: { slidesPerView: 2 },      // 600px+
  900: { slidesPerView: 3 },      // 900px+
  1200: { slidesPerView: 4.5 }    // 1200px+
};
</script>

<style scoped>
.section-title {
  margin-bottom: 32px;
  text-align: left;
  padding-left: 24px;
}

.section-title-text {
  margin: 10px 0;
  font-family: "Inter", "Inter Placeholder", sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.6px;
  line-height: 100%;
  text-transform: uppercase;
  text-decoration: none;
  text-align: start;
  color: #b6b6b6;
}

.video-review-slider {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding-bottom: 60px;
  background: transparent;
  position: relative;
  overflow: hidden;
}

.carousel {
  width: 100%;
  min-height: 220px;
  height: auto;
}

.slider-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
}

.review-video {
  width: 100%;
  max-width: 420px;
  /* aspect-ratio: 16/9; */
  object-fit: cover;
  border-radius: 20px;
  background: #222;
  margin-bottom: 18px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.review-name {
  font-size: 24px;
  font-weight: 700;
  color: #eaeaea;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.5px;
}

/* Адаптив */
@media (max-width: 1200px) {
  .carousel {
    min-height: 180px;
  }

  .review-video {
    max-width: 320px;
  }

  .review-name {
    font-size: 18px;
  }

  .section-title {
    padding-left: 12px;
    margin-bottom: 20px;
  }

  .section-title-text {
    font-size: 16px;
  }
}

@media (max-width: 900px) {
  .carousel {
    min-height: 140px;
  }

  .review-video {
    max-width: 220px;
  }

  .review-name {
    font-size: 15px;
  }
}

@media (max-width: 600px) {
  .carousel {
    min-height: 100px;
  }

  .review-video {
    max-width: 90vw;
  }

  .review-name {
    font-size: 12px;
  }

  .section-title {
    padding-left: 6px;
    margin-bottom: 12px;
  }

  .section-title-text {
    font-size: 13px;
  }
}
</style>