<template>
  <section class="video-review-slider" id="Review">
    <div class="section-title">
      <h2 class="section-title-text">Отзывы</h2>
    </div>
    <div class="swiper-container">
      <swiper :space-between="40" :loop="true" :breakpoints="breakpoints" :navigation="{
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      }" :modules="modules" class="carousel">
        <swiper-slide v-for="(review, idx) in reviews" :key="idx">
          <div class="slider-item">
            <div class="video-frame">
              <video :data-src="review.video" :data-poster="review.poster" :poster="lazyPoster" class="review-video"
                preload="none" :ref="el => videoRefs[idx] = el" @click="togglePlayPause(idx)" @play="onVideoPlay(idx)"
                @pause="onVideoPause(idx)" playsinline disablePictureInPicture>
                Ваш браузер не поддерживает видео.
              </video>
              <button class="fs-btn" @click.stop="goFullscreen(idx)" aria-label="Full screen"></button>
            </div>
            <p class="review-name">{{ review.name }}</p>
          </div>
        </swiper-slide>
      </swiper>

      <!-- Кастомные кнопки навигации -->
      <div class="swiper-button-prev-custom">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
      <div class="swiper-button-next-custom">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import { ref, onMounted, onUnmounted } from 'vue';
import 'swiper/css';
import 'swiper/css/navigation';

// Добавляем модуль Navigation
const modules = [Navigation];

const videoRefs = ref([]);
let observer = null;

// Заглушка для постера
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
  0: { slidesPerView: 1.5 },
  600: { slidesPerView: 2 },
  900: { slidesPerView: 3 },
  1200: { slidesPerView: 4.5 }
};

// Функция для переключения play/pause при клике на видео
const togglePlayPause = (videoIndex) => {
  const v = videoRefs.value[videoIndex];
  if (!v) return;

  // Загружаем видео если еще не загружено
  if (v.getAttribute('data-src')) {
    loadVideo(v);
  }

  if (v.paused) {
    v.play();
  } else {
    v.pause();
  }
};

// Функция для полноэкранного режима
const goFullscreen = (videoIndex) => {
  const v = videoRefs.value[videoIndex];
  if (!v) return;

  // Сначала загружаем видео если оно еще не загружено
  if (v.getAttribute('data-src')) {
    loadVideo(v);
  }

  // iOS Safari
  if (v.webkitEnterFullscreen) {
    try {
      v.webkitEnterFullscreen();
      v.muted = false;
      v.play();
    } catch (_) { }
    return;
  }

  // Other browsers
  if (v.requestFullscreen) v.requestFullscreen();
  try {
    v.muted = false;
    v.play();
  } catch (_) { }
};

// Обработчики событий видео
const onVideoPlay = (videoIndex) => {
  console.log(`Video ${videoIndex} started playing`);
};

const onVideoPause = (videoIndex) => {
  console.log(`Video ${videoIndex} paused`);
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

  video.preload = 'metadata';
};

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        loadVideo(video);
        observer.unobserve(video);
      }
    });
  }, {
    rootMargin: '50px'
  });

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
.swiper,
.swiper-wrapper,
.swiper-slide,
.swiper-slide * {
  user-select: none;
  -webkit-user-select: none;
  /* iOS/Safari */
  -ms-user-select: none;
}

/* Мобильные “блики” при тапе */
.swiper-slide a,
.swiper-slide button {
  -webkit-tap-highlight-color: transparent;
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
}

.section-title-text {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #eaeaea;
}

.video-review-slider {
  padding: 40px 20px;
  background: #111;
}

.carousel {
  padding: 20px 0;
}

.slider-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-frame {
  position: relative;
  display: inline-block;
}

.review-video {
  width: 100%;
  min-width: 270px;
  max-width: 420px;
  max-height: 480px;
  aspect-ratio: 9/16;
  object-fit: cover;
  border-radius: 20px;
  background: #222;
  margin-bottom: 18px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  transition: opacity 0.3s ease;
  cursor: pointer;
  /* Убираем стандартные контролы */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}


.review-video[data-src] {
  opacity: 0.7;
}

.fs-btn {
  position: absolute;
  right: 12px;
  bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease;
}

.fs-btn::before {
  content: "⛶";
  font-size: 16px;
  line-height: 1;
}

.fs-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

/* Стили для полноэкранного режима */
.review-video:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  background: #000;
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  aspect-ratio: auto;
}

.review-video:-webkit-full-screen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  background: #000;
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  aspect-ratio: auto;
}

.review-video:-moz-full-screen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  background: #000;
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  aspect-ratio: auto;
}

.review-video:-ms-fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  background: #000;
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  aspect-ratio: auto;
}



.review-name {
  color: #eaeaea;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}



@media (max-width: 1400px) {
  .video-review-slider {
    /* min-width: 250px; */
    padding: 32px 16px;
  }

  .section-title_text {
    font-size: 28px;
  }
}

@media (max-width: 900px) {
  .review-video {
    /* min-width: 250px; */
    max-width: 380px;
    border-radius: 16px;
  }

  .section-title_text {
    font-size: 24px;
  }
}

@media (max-width: 600px) {
  .video-review-slider {
    padding: 24px 12px;
  }

  .review-video {
    min-width: 230px;
    max-width: 340px;
    border-radius: 14px;
  }

  .section-title_text {
    font-size: 22px;
  }

  .fs-btn {
    right: 8px;
    bottom: 25px;
    /* padding: 6px 8px; */
  }

  .fs-btn::before {
    font-size: 22px;
  }
}

/* ... existing styles ... */

.swiper-container {
  position: relative;
}

/* Кастомные кнопки навигации */
.swiper-button-prev-custom,
.swiper-button-next-custom {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  color: #fff;
  backdrop-filter: blur(10px);
}

.swiper-button-prev-custom:focus,
.swiper-button-next-custom:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

.swiper-button-prev-custom {
  left: -25px;
}

.swiper-button-next-custom {
  right: -25px;
}

.swiper-button-prev-custom:hover,
.swiper-button-next-custom:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.swiper-button-prev-custom:active,
.swiper-button-next-custom:active {
  transform: translateY(-50%) scale(0.95);
}

/* Состояние disabled */
.swiper-button-prev-custom.swiper-button-disabled,
.swiper-button-next-custom.swiper-button-disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

/* Адаптив для кнопок */
@media (max-width: 1200px) {
  .swiper-button-prev-custom {
    left: -20px;
  }

  .swiper-button-next-custom {
    right: -20px;
  }
}

@media (max-width: 900px) {

  .swiper-button-prev-custom,
  .swiper-button-next-custom {
    width: 45px;
    height: 45px;
  }

  .swiper-button-prev-custom {
    left: -15px;
  }

  .swiper-button-next-custom {
    right: -15px;
  }
}

@media (max-width: 600px) {

  .swiper-button-prev-custom,
  .swiper-button-next-custom {
    width: 40px;
    height: 40px;
  }

  .swiper-button-prev-custom {
    left: -10px;
  }

  .swiper-button-next-custom {
    right: -10px;
  }

  .swiper-button-prev-custom svg,
  .swiper-button-next-custom svg {
    width: 20px;
    height: 20px;
  }
}

/* Скрываем кнопки на очень маленьких экранах */
@media (max-width: 480px) {

  .swiper-button-prev-custom,
  .swiper-button-next-custom {
    display: none;
  }
}
</style>