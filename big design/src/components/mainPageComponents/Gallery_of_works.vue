<template>
  <section id="student_work_section" class="works-gallery">
    <div class="container">
      <div class="section-title">
        <h2 class="section-title-text">Работы учеников</h2>
      </div>
      <!-- Вертикальные видео -->
      <ul class="cards vertical-cards" role="list">
        <li v-for="item in verticalVideos" :key="item.slug" class="card">
          <div class="card-link" :aria-label="item.title" @click="open(item)"
            @mouseenter="isMobile ? null : playVideo(item.slug)" @mouseleave="isMobile ? null : pauseVideo(item.slug)">
            <div class="video-wrap">
              <video :id="`video-${item.slug}`" :src="item.video" :poster="isMobile ? item.poster : ''" muted
                preload="metadata" loop playsinline></video>
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
              <video :id="`video-${item.slug}`" :src="item.video" :poster="item.poster" muted preload="metadata" loop
                playsinline></video>
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

            </div>
            <aside class="right">
              <h2 class="meta-title">Отзыв</h2>
              <p class="review-text">
                {{ selected.review }}
              </p>
            </aside>
          </header>

          <div class="media-container" :style="!selected.reviewVideo ? 'display: flex; justify-content: center;' : ''">
            <!-- Левое видео - работа -->
            <div class="video-section" :style="!selected.reviewVideo ? 'max-width: 600px; width: 100%;' : ''">
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
          studentName: "Работа Ольги Овсейчик",
          tag: "Работа ученицы клуба Ольги",
          review:
            "Всем привет!\n Вот и подошло к концу моё первое обучение (уверена, что далеко не последнее 😅) в клубе @bigdesign.pro \n \n За эти 4 недели я каждый день наблюдала, как преображается моя работа буквально на глазах — благодаря подробным и честным фитбекам от кураторов и участников чата. За это — огромное спасибо! 💬❤️\n \n Созвоны с Ваней и Женей — это отдельный источник вдохновения и тонны ценной информации. Каждый раз я уходила с новыми инсайтами, пониманием, как улучшить свою работу и двигаться дальше.\n \n Отдельное спасибо за поддержку, разборы, за искреннюю вовлечённость и атмосферу, в которой хочется развиваться 💫\n Для меня это был важный шаг вперёд — и теперь хочется ещё сильнее, ещё лучше, ещё глубже в моушн!\n \n Спасибо @kolodii.cg за крутое сообщество! 🔥",
          video: "/gallery_of_works_video/01.mp4",
          reviewVideo: "/gallery_of_works_review/01.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/01.png"
        },
        {
          slug: "natalia",
          studentName: "Работа ученицы Наталии",
          tag: "Работа ученицы клуба Наталии",
          review:
            "Привет!\n Делюсь впечатлениями от прохождения курса в BigDesign: было интересно и продуктивно. Кураторы Ваня и Женя давали очень классный фитбек, благодаря которому, я смогла сделать хорошую работу. Так же у других участников курса была возможность анализировать работы друг друга и предлагать варианты решения каких-либо проблем, такая практика способствует росту.\n К сожалению, из-за большой разницы во времени я часто пропускала посиделки в дискорде, но все же могу подчеркнуть теплую атмосферу и поддержку на курсе.\n Была рада принимать участие на курсе:)\n",
          video: "/gallery_of_works_video/02.mp4",
          reviewVideo: "/gallery_of_works_review/02.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/02.png"
        },
        {
          slug: "sultan",
          studentName: "Работа ученика Султана",
          tag: "Работа ученика клуба Султана",
          review:
            "Курс прошёл для меня отлично. Я начал понимать структуру работы над проектами, разобрался в своих сильных и слабых сторонах. Научился анализировать работы, замечать детали, отличать хорошее исполнение от слабого, а также работать с референсами и грамотно использовать их в проектах.\n \n Отдельно хочу отметить, что Ваня очень подробно раскрыл тему рынка: кто за что отвечает, как устроены взаимодействия между агентствами, студиями и продакшенами. Это сильно расширило моё представление о профессии.\n \n Также приглашённый спикер круто поделился своим опытом: рассказал про свой путь, методы поиска клиентов и способы преодоления сложностей. Было очень вдохновляюще и по делу.\n \n Большое влияние оказал и фидбек от других учеников — он был мощным, честным и помог мне увидеть то, чего сам не замечал. Благодаря этому я ещё глубже понял свои сильные стороны и зоны роста.\n \n Для меня главное — я понял, на что действительно способен и в каком направлении хочу развиваться дальше\n",
          video: "/gallery_of_works_video/03.mp4",
          reviewVideo: "/gallery_of_works_review/03.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/03.png"
        },
        {
          slug: "boris",
          studentName: "Работа ученика Бориса",
          tag: "Работа ученика клуба Бориса",
          review:
            "Привет! Я прошел 4-недельный курс в 3D клубе от BigDesign.\nЗа этот период я приобрел новые знания и знакомства, научился лучше анализировать свою сцену и, конечно, довел свою работу до качественного результата!\n\nТакже хочу поблагодарить кураторов - Ваню и Женю за проделанную работу! Каждый из них дал ценную информацию, что значительно помогло мне в развитии. Спасибо вам за поддержку, ребята!!!",
          video: "/gallery_of_works_video/04.mp4",
          reviewVideo: "/gallery_of_works_review/04.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/04.png"
        },
        {
          slug: "vasilisa",
          studentName: "Работа ученицы Василисы",
          tag: "Работа ученика клуба Василия",
          review:
            "\n Йо, мне очень зашел курс, смог проработать свои слабые стороны лукдевинга, отдельный респект Ване, чиловый парень, оч много получал фидбека именно от него, так что если желаете улучшить свои навыки, то рекомендую данный курс, тем более на рынке он максимально демократичная цена\n",
          video: "/gallery_of_works_video/05.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/05.png"
        },
        {
          slug: "denisa",
          studentName: "Работа ученика Дениса Мещерякова",
          tag: "Работа ученика клуба Дениса",
          review:
            "Всем привет!\nДелюсь с вами, что дало мне прохождения клуба. В первую очередь — это очень крепкую базу в Cinema 4D и работе с лукдевом. К тому же я получил уверенность в собственных силах — благодаря поддержке кураторов и комьюнити я стал чувствовать себя гораздо увереннее в работе с эффектами и сложными сценами.\nДенис Мещеряков",
          video: "/gallery_of_works_video/06.mp4",
          reviewVideo: "/gallery_of_works_review/06.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/06.png"
        },
        {
          slug: "vitaly",
          studentName: "Работа ученика Виталия Иванца",
          tag: "Работа ученика клуба Виталия",

          review:
            "Хочу сказать пару слов благодарности.\nЭто видео я создал в рамках замечательного клуба моушн дизайна. Несколько раз в неделю мы проводили онлайн встречи, на которых получали ответы на вопросы, улучшали визуальный вкус, общались и росли вместе.\nИзучили важные темы — от профессиональных навыков до личностного роста.\nНа встречах были и люди, которые работают с мировыми брендами и уже вышли на студийный уровень.\nОдин из важнейших уроков, который я усвоил в этом году, — это понимание того, что правильная среда все меняет.\nСовсем скоро, наверное, поделюсь первыми результатами этой работы и окончательным вариантом - и все станет понятно. ))\nТак что спасибо",
          video: "/gallery_of_works_video/07.mp4",
          reviewVideo: "/gallery_of_works_review/07.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/07.png"
        },
        {
          slug: "vas",
          studentName: "Работа ученика Василия",
          tag: "Работа ученика Василия",
          // review:
          //   "Отличный курс с современными технологиями и подходами. Много практики, качественный материал. После курса получил первые заказы. Спасибо команде! НЕТ ОТЗИВА",
          video: "/gallery_of_works_video/08.mp4",
          // reviewVideo: "/gallery_of_works_video/review_08.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/08.png"
        },
        {
          slug: "x",
          studentName: " Работа ученика Влада",
          tag: "Работа ученика клуба Влада",
          review:
            "\n Дуже радий поділитися цим 3D-проєктом! Я змоделював клавіатуру під назвою KNOB від @work_louder та @benfryc_art, і це був пізнавальний досвід! В планах вже є подальша повноцінна робота з цією моделлю, але це з часом.\n Хочу висловити величезну подяку @kolodii.cg за можливість долучитися до @bigdesign.pro. Це було дуже цікаво – переймати його досвід та розширювати коло однодумців. Цей клуб та проєкт однозначно допоміг мені вийти на новий рівень!\n ",
          video: "/gallery_of_works_video/Final Render2.mp4",
          // reviewVideo: "/gallery_of_works_video/Final Render2.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/09.png"
        },
      ],
      // Горизонтальные видео
      horizontalVideos: [
        {
          slug: "maxim-horizontal",
          studentName: "Работа ученика Савелия",
          tag: "Работа ученика клуба Савелия",
          review:
            "Всем привет! Недавно завершил 4-недельный курс в 3D клубе от BigDesign, и у меня остались исключительно положительные впечатления. За это время я освоил новые техники и расширил свои знания, а также познакомился с замечательными людьми.\n \n Особую благодарность хочу выразить кураторам — Ване и Жене. Их ценная обратная связь и индивидуальный подход значительно помогли мне в развитии. Благодаря их поддержке я улучшил свою работу и довел её до высокого качества\n\n Спасибо вам за профессионализм и вдохновение!\n",
          video: "/gallery_of_works_video/09.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/010.png"
        },
        {
          slug: "elena-horizontal",
          studentName: "Работа ученика Никиты",
          tag: "Работа ученика клуба Никиты",
          review:
            "Всем привет! Давно наблюдал за творчеством Вани и его каналом BigDesign. Сразу увидел в нем потенциал: талантливый и организованный человек! 💪\n Недавно решил вступить в его клуб, улучшить свои навыки и набраться опыта. Мне очень понравилось быть частью этого комьюнити, добрейшая атмосфера, превосходный фидбек! Ребята находят подход к каждому, отвечают на все интересующие вопросы, помогают в технической части. Благодаря освоенному материалу, я стал лучше понимать многие процессы в синеме и быстрее ориентироваться в интерфейсе.\n Также не могу не пройти мимо куратора Евгения, с ним я знаком еще до вступления клуба. Добрейший души человек, отец синьки) Очень многое внес в создание контента для клуба 👏\n В общем, респект за создание такого клуба! Ребята, вы молодцы!🔥 Таким людям определено буду рад помочь☺️\n",
          video: "/gallery_of_works_video/010.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/11.png"
        },
        {
          slug: "dmitry-horizontal",
          studentName: "Работа ученика Бориса",
          tag: "Работа ученика клуба Бориса",

          review:
            "Привет! Я прошел 4-недельный курс в 3D клубе от BigDesign.\nЗа этот период я приобрел новые знания и знакомства, научился лучше анализировать свою сцену и, конечно, довел свою работу до качественного результата!\n\nТакже хочу поблагодарить кураторов - Ваню и Женю за проделанную работу! Каждый из них дал ценную информацию, что значительно помогло мне в развитии. Спасибо вам за поддержку, ребята!!!",
          video: "/gallery_of_works_video/011.mp4",
          reviewVideo: "/gallery_of_works_review/04.mp4",
          poster: "/gallery_of_works_video/gallery_of_work_screen/12.png"
        },
        {
          slug: "anna-horizontal",
          studentName: "Работа ученицы Леры",
          tag: "Работа ученицы Леры",
          review:
            "Отличный курс для освоения горизонтального видео! Много практических заданий, качественная обратная связь. Теперь уверенно работаю в этом формате. НЕТ ОТЗИВА",
          video: "/gallery_of_works_video/012.MOV",
          poster: "/gallery_of_works_video/gallery_of_work_screen/13.png"
        },
      ],
      isMobile: false,
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
    this.isMobile = window.innerWidth <= 600;
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

.card {
  border-radius: 18px;

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
  background: linear-gradient(rgb(144, 144, 144) 0%, rgb(26, 26, 26) 100%);
  border-radius: 5px 5px 18px 18px;
  border: 0;
  padding: 8px 8px 25px;
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
