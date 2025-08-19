<template>
  <section id="student_work_section" class="works-gallery">
    <div class="container">
      <div class="section-title">
        <h2 class="section-title-text">Работы учеников</h2>
      </div>
      <!-- Вертикальные видео -->
      <ul class="cards vertical-cards" role="list">
        <li v-for="item in verticalVideos" :key="item.slug" class="card">
          <div class="card-link" :aria-label="item.title" @click="open(item)" @mouseenter="playVideo(item.slug)"
            @mouseleave="pauseVideo(item.slug)">
            <div class="video-wrap">
              <video :id="`video-${item.slug}`" :src="item.video" muted preload="metadata" loop playsinline></video>
            </div>
            <div class="meta">
              <h3 class="title">{{ item.title }}</h3>
              <p class="tag">{{ item.tag }}</p>
            </div>
          </div>
        </li>
      </ul>

      <!-- Горизонтальные видео -->
      <ul class="cards horizontal-cards" role="list">
        <li v-for="item in horizontalVideos" :key="item.slug" class="card horizontal-card">
          <div class="card-link horizontal-card-link" :aria-label="item.title" @click="open(item)"
            @mouseenter="playVideo(item.slug)" @mouseleave="pauseVideo(item.slug)">
            <div class="video-wrap horizontal-video-wrap">
              <video :id="`video-${item.slug}`" :src="item.video" muted preload="metadata" loop playsinline></video>
            </div>
            <div class="meta">
              <h3 class="title">{{ item.title }}</h3>
              <p class="tag">{{ item.tag }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Детали работы как модальное окно (БЕЗ роутера) -->
    <transition name="fade">
      <div v-if="selected" class="overlay" @click.self="close">
        <div class="sheet" role="dialog" aria-modal="true" :aria-label="selected.title">
          <button class="close" @click="close" aria-label="Close">×</button>

          <header class="head">
            <div class="left">
              <h1 class="d-title">{{ selected.studentName }}</h1>
              <p class="d-sub">
                Обучился с {{ selected.studyStart }} до {{ selected.studyEnd }}
              </p>
            </div>
            <aside class="right">
              <h2 class="meta-title">Отзыв</h2>
              <p class="review-text">
                {{ selected.review }}
              </p>
            </aside>
          </header>

          <div class="media-container">
            <!-- Левое видео - работа -->
            <div class="video-section">
              <h3 class="video-title">Работа</h3>
              <div class="video-frame">
                <video ref="workVideo" :src="selected.video" playsinline preload="metadata" class="hero-video" autoplay
                  muted></video>
                <button class="fs-btn" @click="goFullscreen('workVideo')" aria-label="Full screen"></button>
              </div>
            </div>

            <!-- Правое видео - отзыв -->
            <div class="video-section" v-if="selected.reviewVideo">
              <h3 class="video-title">Видео-отзыв</h3>
              <div class="video-frame">
                <video ref="reviewVideo" :src="selected.reviewVideo" playsinline preload="metadata" class="hero-video"
                  muted></video>
                <button class="fs-btn" @click="goFullscreen('reviewVideo')" aria-label="Full screen"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
export default {
  name: "GalleryOfWorks",
  data() {
    return {
      selected: null,
      // Вертикальные видео
      verticalVideos: [
        {
          slug: "vasiliy",
          studentName: "Работа ученика Василия",
          tag: "Работа ученицы клуба Ольги",
          studyStart: "01.01.2001",
          studyEnd: "01.02.2001",
          review:
            "Йо, мне очень зашел курс, смог проработать свои слабые стороны лукдевинга, отдельный респект Ване, чиловый парень, оч много получал фидбека именно от него, так что если желаете улучшить свои навыки, то рекомендую данный курс, тем более на рынке он максимально демократичная цена",
          video: "/gallery_of_works_video/01.mp4",
          reviewVideo: "/gallery_of_works_video/review_01.mp4",
        },
        {
          slug: "natalia",
          studentName: "Работа ученицы Наталии",
          tag: "Работа ученицы клуба Наталии",
          studyStart: "15.02.2023",
          studyEnd: "15.04.2023",
          review:
            "Курс превзошел все мои ожидания! Структурированная подача материала и постоянная поддержка от преподавателей помогли мне освоить VFX с нуля. Особенно понравились практические задания.",
          video: "/gallery_of_works_video/02.mp4",
          reviewVideo: "/gallery_of_works_video/review_02.mp4",
        },
        {
          slug: "sultan",
          studentName: "Работа ученика Султана",
          tag: "Работа ученика клуба Султана",
          studyStart: "10.03.2024",
          studyEnd: "10.05.2024",
          review:
            "Отличный курс для начинающих и опытных. Много практики, хорошие примеры, качественная обратная связь. Рекомендую всем, кто хочет серьезно заниматься 3D и VFX.",
          video: "/gallery_of_works_video/03.mp4",
          reviewVideo: "/gallery_of_works_video/review_03.mp4",
        },
        {
          slug: "boris",
          studentName: "Работа ученика Бориса",
          tag: "Работа ученика клуба Бориса",
          studyStart: "05.04.2024",
          studyEnd: "05.06.2024",
          review:
            "Прекрасная организация курса, много полезной информации. Преподаватели всегда готовы помочь и объяснить сложные моменты. Результат превзошел ожидания.",
          video: "/gallery_of_works_video/04.mp4",
          reviewVideo: "/gallery_of_works_video/review_04.mp4",
        },
        {
          slug: "vasilisa",
          studentName: "Работа ученицы Василисы",
          tag: "Работа ученика клуба Василия",
          studyStart: "01.05.2024",
          studyEnd: "01.07.2024",
          review:
            "Курс помог мне понять основы VFX и 3D графики. Много практических заданий, которые помогают закрепить теорию. Отличное соотношение цены и качества.",
          video: "/gallery_of_works_video/05.mp4",
          reviewVideo: "/gallery_of_works_video/review_05.mp4",
        },
        {
          slug: "denisa",
          studentName: "Работа ученицы Денисы",
          tag: "Работа ученика клуба Дениса",
          studyStart: "15.06.2024",
          studyEnd: "15.08.2024",
          review:
            "Замечательный курс! Все объясняется понятно и доступно. Преподаватели профессионалы своего дела. После курса уверенно работаю с Blender и After Effects.",
          video: "/gallery_of_works_video/06.mp4",
          reviewVideo: "/gallery_of_works_video/review_06.mp4",
        },
        {
          slug: "vitaly",
          studentName: "Работа ученика Виталия",
          tag: "Работа ученика клуба Виталия",
          studyStart: "20.07.2024",
          studyEnd: "20.09.2024",
          review:
            "Курс дал мне все необходимые знания для работы в сфере VFX. Особенно ценю индивидуальный подход и детальные разборы работ. Рекомендую!",
          video: "/gallery_of_works_video/07.mp4",
          reviewVideo: "/gallery_of_works_video/review_07.mp4",
        },
        {
          slug: "alex",
          studentName: "Работа ученика Алексея",
          tag: "VFX",
          studyStart: "01.08.2024",
          studyEnd: "01.10.2024",
          review:
            "Отличный курс с современными технологиями и подходами. Много практики, качественный материал. После курса получил первые заказы. Спасибо команде!",
          video: "/gallery_of_works_video/08.mp4",
          reviewVideo: "/gallery_of_works_video/review_08.mp4",
        },
        {
          slug: "x",
          studentName: " Алексея",
          tag: "FX",
          studyStart: "01.08.2024",
          studyEnd: "01.10.2024",
          review:
            "Отличный курс с современными технологиями и подходами. Много практики, качественный материал. После курса получил первые заказы. Спасибо команде!",
          video: "/gallery_of_works_video/Final Render2.mp4",
          reviewVideo: "/gallery_of_works_video/Final Render2.mp4",
        },
      ],
      // Горизонтальные видео
      horizontalVideos: [
        {
          slug: "maxim-horizontal",
          studentName: "Работа ученика Максима",
          tag: "Работа ученика клуба Максима",
          studyStart: "01.09.2024",
          studyEnd: "01.11.2024",
          review:
            "Курс помог мне освоить горизонтальный формат видео и создавать качественный контент для различных платформ. Отличная подача материала и поддержка преподавателей.",
          video: "/gallery_of_works_video/09.mp4",
          reviewVideo: "/gallery_of_works_video/review_horizontal_01.mp4",
        },
        {
          slug: "elena-horizontal",
          studentName: "Работа ученицы Елены",
          tag: "Работа ученицы клуба Елены",
          studyStart: "15.09.2024",
          studyEnd: "15.11.2024",
          review:
            "Благодаря курсу научилась создавать профессиональные горизонтальные видео. Много практики и индивидуальной работы с преподавателями. Очень довольна результатом!",
          video: "/gallery_of_works_video/010.mp4",
          reviewVideo: "/gallery_of_works_video/review_horizontal_02.mp4",
        },
        {
          slug: "dmitry-horizontal",
          studentName: "Работа ученика Дмитрия",
          tag: "Работа ученика клуба Дмитрия",
          studyStart: "01.10.2024",
          studyEnd: "01.12.2024",
          review:
            "Курс превзошел ожидания! Научился работать с горизонтальными форматами, композицией и монтажом. Преподаватели всегда готовы помочь и дать ценные советы.",
          video: "/gallery_of_works_video/011.mp4",
          reviewVideo: "/gallery_of_works_video/review_horizontal_03.mp4",
        },
        {
          slug: "anna-horizontal",
          studentName: "Работа ученицы Анны",
          tag: "Работа ученицы клуба Анны",
          studyStart: "15.10.2024",
          studyEnd: "15.12.2024",
          review:
            "Отличный курс для освоения горизонтального видео! Много практических заданий, качественная обратная связь. Теперь уверенно работаю в этом формате.",
          video: "/gallery_of_works_video/012.MOV",
          reviewVideo: "/gallery_of_works_video/review_horizontal_04.mp4",
        },
      ],
    };
  },
  methods: {
    playVideo(slug) {
      const video = document.getElementById(`video-${slug}`);
      if (video) video.play();
    },
    pauseVideo(slug) {
      const video = document.getElementById(`video-${slug}`);
      if (video) video.pause();
    },
    open(item) {
      this.selected = item;
      // опционально: блокуємо скрол сторінки, поки відкрита модалка
      document.body.style.overflow = "hidden";
    },
    close() {
      this.selected = null;
      document.body.style.overflow = "";
    },
    onKey(e) {
      if (e.key === "Escape" && this.selected) this.close();
    },
    goFullscreen(videoRef) {
      const v = this.$refs[videoRef];
      if (!v) return;
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
    },
  },
  mounted() {
    window.addEventListener("keydown", this.onKey);
  },
  unmounted() {
    window.removeEventListener("keydown", this.onKey);
  },
};
</script>

<style scoped>
.section-title-text {
  margin: 10px;
  font-family: "Inter", "Inter Placeholder", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.6px;
  line-height: 100%;
  text-transform: uppercase;
  text-decoration: none;
  text-align: start;
  color: #b6b6b6;
}

/* ГАЛЕРЕЯ - Вертикальные карточки */
.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px 16px;
}

.cards {
  display: grid;
  gap: 28px;
  list-style: none;
  margin: 0 0 40px 0;
  padding: 0;
}

/* Вертикальные видео - 3 в ряд */
.vertical-cards {
  grid-template-columns: repeat(3, 1fr);
}

/* Горизонтальные видео - 2 в ряд */
.horizontal-cards {
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 0;
}

.card-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  background: #171717;
  border-radius: 18px;
  border: 4px solid #7a1f1f;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  /* Вертикальное соотношение */
  background: #0e0e0e;
}

/* Горизонтальное видео */
.horizontal-video-wrap {
  aspect-ratio: 16/9;
  /* Горизонтальное соотношение */
}

.video-wrap video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta {
  padding: 16px 18px 20px;
}

.title {
  margin: 0 0 6px;
  font-size: 22px;
  color: #fff;
  font-weight: 800;
}

.tag {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

/* Адаптив для планшетов */
@media (max-width: 1199px) {
  .vertical-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .horizontal-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Адаптив для мобильных */
@media (max-width: 767px) {

  .vertical-cards,
  .horizontal-cards {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .title {
    font-size: 18px;
  }

  .horizontal-video-wrap {
    aspect-ratio: 16/10;
    /* Немного выше на мобильных */
  }
}

/* Средние планшеты */
@media (max-width: 991px) and (min-width: 768px) {
  .horizontal-cards {
    grid-template-columns: 1fr;
    /* 1 в ряд на средних планшетах */
  }
}

/* МОДАЛКА (детали роботи) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: grid;
  place-items: center;
  z-index: 1100;
  padding: 24px;
}

.sheet {
  width: min(1200px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #141414;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 24px;
}

.close {
  position: sticky;
  top: 0;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
}

.close:hover {
  background: rgba(255, 255, 255, 0.08);
}

.head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
  margin-bottom: 20px;
  color: #eaeaea;
}

.d-title {
  font-size: 32px;
  line-height: 1.1;
  margin: 0 0 8px;
}

.d-sub {
  font-size: 16px;
  opacity: 0.85;
  margin: 0;
}

.meta-title {
  margin: 0 0 12px;
  font-size: 24px;
}

.review-text {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
  line-height: 1.5;
}

/* Новый контейнер для двух видео */
.media-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.video-section {
  display: flex;
  flex-direction: column;
}

.video-title {
  margin: 0 0 12px;
  font-size: 18px;
  color: #eaeaea;
  font-weight: 600;
}

.video-frame {
  position: relative;
}

.hero-video {
  width: 100%;
  height: auto;
  max-height: 50vh;
  object-fit: contain;
  border-radius: 14px;
  background: #0e0e0e;
  display: block;
}

.fs-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
}

.fs-btn::before {
  content: "⛶";
  font-size: 16px;
  line-height: 1;
}

.fs-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

@media (max-width: 1024px) {
  .head {
    grid-template-columns: 1fr;
  }

  .media-container {
    grid-template-columns: 1fr;
  }

  .d-title {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .sheet {
    padding: 16px;
    border-radius: 14px;
  }

  .overlay {
    padding: 12px;
  }

  .d-title {
    font-size: 24px;
  }

  .hero-video {
    max-height: 40vh;
  }
}
</style>
