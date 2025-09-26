<template>
  <section class="video-review-slider" id="Review">
    <div class="section-title">
      <h2 class="section-title-text">Отзывы</h2>
    </div>
    <swiper :space-between="40" :loop="true" :breakpoints="breakpoints" class="carousel">
      <swiper-slide v-for="(review, idx) in reviews" :key="idx">
        <div class="slider-item">
          <video :data-src="review.video" :data-poster="review.poster" :poster="lazyPoster" controls
            class="review-video" preload="none" :ref="el => videoRefs[idx] = el">
            Ваш браузер не поддерживает видео.
          </video>
          <p class="review-name">{{ review.name }}</p>
        </div>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { ref, onMounted, onUnmounted } from 'vue';
import 'swiper/css';

const videoRefs = ref([]);
let observer = null;

// Заглушка для постера (можно заменить на свое изображение)
const lazyPoster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIwIiBoZWlnaHQ9Ijc0NyIgdmlld0JveD0iMCAwIDQyMCA3NDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MjAiIGhlaWdodD0iNzQ3IiBmaWxsPSIjMjIyIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE2Ij7Qs9GA0YPQt9C40YLRgdGPLi4uPC90ZXh0Pgo8L3N2Zz4K';

const reviews = [
  { video: "/gallery_of_works_review/01).mp4", name: "Ольга", poster: "/gallery_of_works_review/gallery_of_works_review_img/olga.png" },
  { video: "/gallery_of_works_review/02).mp4", name: "Наталия", poster: "/gallery_of_works_review/gallery_of_works_review_img/Наталья.png" },
  { video: "/gallery_of_works_review/03).mp4", name: "Султан", poster: "/gallery_of_works_review/gallery_of_works_review_img/Султан.png" },
  { video: "/gallery_of_works_review/04).mp4", name: "Борис", poster: "/gallery_of_works_review/gallery_of_works_review_img/Борис.png" },
  { video: "/gallery_of_works_review/06).mp4", name: "Денис", poster: "/gallery_of_works_review/gallery_of_works_review_img/Денис.png" },
  { video: "/gallery_of_works_review/07).mp4", name: "Виталий", poster: "/gallery_of_works_review/gallery_of_works_review_img/Виталий.png" },
];

// Адаптивные настройки Swiper
const breakpoints = {
  0: { slidesPerView: 1.5 },      // до 600px
  600: { slidesPerView: 2 },      // 600px+
  900: { slidesPerView: 3 },      // 900px+
  1200: { slidesPerView: 4.5 }    // 1200px+
};

// Функция для ленивой загрузки
const loadVideo = (video) => {
  const src = video.getAttribute('data-src');
  const poster = video.getAttribute('data-poster');

  if (src) {
    video.src = src;
    video.removeAttribute('data-src');
  }

  if (poster) {
    video.poster = poster;
    video.removeAttribute('data-poster');
  }

  // Предзагрузка метаданных только после того, как видео в области видимости
  video.preload = 'metadata';
};

onMounted(() => {
  // Создаем Intersection Observer для ленивой загрузки
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        loadVideo(video);
        observer.unobserve(video);
      }
    });
  }, {
    rootMargin: '50px' // Начинаем загрузку за 50px до появления в области видимости
  });

  // Наблюдаем за всеми видео элементами
  videoRefs.value.forEach(video => {
    if (video) {
      observer.observe(video);
    }
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
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
  aspect-ratio: 9/16;
  object-fit: cover;
  border-radius: 20px;
  background: #222;
  margin-bottom: 18px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  transition: opacity 0.3s ease;
}

.review-video[data-src] {
  opacity: 0.7;
}

.fullscreen-video {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  background: #222;
  margin: 0 auto;
  display: block;
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