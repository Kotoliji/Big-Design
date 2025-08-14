<template>
  <section id="student_work_section" class="works-gallery">
    <div class="container">
      <div class="section-title">
        <h2 class="section-title-text">Работы учеников</h2>
      </div>
      <ul class="cards" role="list">
        <li v-for="item in catalog" :key="item.slug" class="card">
          <div
            class="card-link"
            :aria-label="item.title"
            @click="open(item)"
            @mouseenter="playVideo(item.slug)"
            @mouseleave="pauseVideo(item.slug)"
          >
            <div class="video-wrap">
              <video
                :id="`video-${item.slug}`"
                :src="item.video"
                muted
                preload="metadata"
                loop
                playsinline
              ></video>
            </div>
            <div class="meta">
              <h3 class="title">{{ item.title }}</h3>
              <p class="tag">{{ item.tag }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Деталі роботи як модальне вікно (БЕЗ роутера) -->
    <transition name="fade">
      <div v-if="selected" class="overlay" @click.self="close">
        <div
          class="sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="selected.title"
        >
          <button class="close" @click="close" aria-label="Close">×</button>

          <header class="head">
            <div class="left">
              <h1 class="d-title">{{ selected.title }}</h1>
              <p v-if="selected.subtitle" class="d-sub">
                {{ selected.subtitle }}
              </p>
            </div>
            <aside class="right">
              <h2 class="meta-title">Project Details</h2>
              <p v-if="selected.description" class="desc">
                {{ selected.description }}
              </p>
              <ul class="kv">
                <li>
                  <span>Client</span><b>{{ selected.client || "—" }}</b>
                </li>
                <li>
                  <span>Category</span><b>{{ selected.category || "—" }}</b>
                </li>
                <li>
                  <span>Year</span><b>{{ selected.year || "—" }}</b>
                </li>
              </ul>
            </aside>
          </header>

          <div class="media" v-if="selected.video">
            <div class="video-frame">
              <video
                ref="detailVideo"
                :src="selected.video"
                playsinline
                preload="metadata"
                class="hero-video"
                autoplay
                muted
              ></video>
              <button
                class="fs-btn"
                @click="goFullscreen"
                aria-label="Full screen"
              ></button>
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
      // Відео з public/gallery_of_works_video
      catalog: [
        {
          slug: "mercedes",
          title: "Mercedes",
          tag: "Viral VFX",
          category: "Viral VFX",
          year: "2024",
          client: "Mercedes",
          subtitle: "Automotive viral VFX piece.",
          description:
            "Short viral VFX spot with seamless CG integration and tracked shots.",
          video: "/gallery_of_works_video/01.mp4",
        },
        {
          slug: "marvels-spider-man-2",
          title: "Marvel's Spider‑Man 2",
          tag: "Viral VFX",
          category: "Viral VFX",
          year: "2024",
          client: "—",
          subtitle: "CGI stunt concept",
          description:
            "CG work inspired by the game IP. Focus on dynamics and compositing.",
          video: "/gallery_of_works_video/02.mp4",
        },
        {
          slug: "luciano-loco",
          title: "Luciano Loco",
          tag: "Motion Design",
          category: "Motion Design",
          year: "2024",
          client: "Luciano Loco",
          subtitle: "Merch CGI commercial",
          description:
            "Full CGI promo for merchandise aligned with album color palette.",
          video: "/gallery_of_works_video/03.mp4",
        },
        {
          slug: "work-04",
          title: "Project 04",
          tag: "VFX",
          category: "VFX",
          year: "2024",
          video: "/gallery_of_works_video/04.mp4",
        },
        {
          slug: "work-05",
          title: "Project 05",
          tag: "VFX",
          category: "VFX",
          year: "2024",
          video: "/gallery_of_works_video/05.mp4",
        },
        {
          slug: "work-06",
          title: "Project 06",
          tag: "VFX",
          category: "VFX",
          year: "2024",
          video: "/gallery_of_works_video/06.mp4",
        },
        {
          slug: "work-07",
          title: "Project 07",
          tag: "VFX",
          category: "VFX",
          year: "2024",
          video: "/gallery_of_works_video/07.mp4",
        },
        {
          slug: "work-08",
          title: "Project 08",
          tag: "VFX",
          category: "VFX",
          year: "2024",
          video: "/gallery_of_works_video/08.mp4",
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
      // опціонально: блокуємо скрол сторінки, поки відкрита модалка
      document.body.style.overflow = "hidden";
    },
    close() {
      this.selected = null;
      document.body.style.overflow = "";
    },
    onKey(e) {
      if (e.key === "Escape" && this.selected) this.close();
    },
    goFullscreen() {
      const v = this.$refs.detailVideo;
      if (!v) return;
      // iOS Safari
      if (v.webkitEnterFullscreen) {
        try {
          v.webkitEnterFullscreen();
          v.muted = false;
          v.play();
        } catch (_) {}
        return;
      }
      // Other browsers
      if (v.requestFullscreen) v.requestFullscreen();
      try {
        v.muted = false;
        v.play();
      } catch (_) {}
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
  font-weight: 500; /* обычная */
  letter-spacing: 0.6px;
  line-height: 100%;
  text-transform: uppercase;
  text-decoration: none;
  text-align: start;
  color: #b6b6b6;
}
/* ГАЛЕРЕЯ */
.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px 16px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  list-style: none;
  margin: 0;
  padding: 0;
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
  background: #0e0e0e;
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
@media (max-width: 1199px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
@media (max-width: 767px) {
  .cards {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .title {
    font-size: 18px;
  }
}

/* МОДАЛКА (деталі роботи) */
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
  width: min(960px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: #141414;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 24px;
} /* was 1100px */
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
  grid-template-columns: 1.3fr 1fr;
  gap: 28px;
  align-items: start;
  margin-bottom: 20px;
  color: #eaeaea;
}
.d-title {
  font-size: 40px;
  line-height: 1.1;
  margin: 0 0 8px;
}
.d-sub {
  font-size: 18px;
  opacity: 0.85;
  margin: 0;
}
.meta-title {
  margin: 0 0 8px;
  font-size: 20px;
}
.desc {
  margin: 0 0 12px;
  opacity: 0.85;
}
.kv {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.kv li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  padding: 6px 0;
}
.kv span {
  opacity: 0.7;
}
.kv b {
  font-weight: 700;
}
.media {
  margin-top: 16px;
}
.hero-video {
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 14px;
  background: #0e0e0e;
  display: block;
}

@media (max-width: 1024px) {
  .head {
    grid-template-columns: 1fr;
  }
  .d-title {
    font-size: 32px;
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
}
.video-frame {
  position: relative;
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
</style>
