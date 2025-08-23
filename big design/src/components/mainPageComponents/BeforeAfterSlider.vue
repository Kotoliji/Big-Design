<template>
  <section class="before-after-clean">
    <!-- Подписи над изображением -->
    <div class="labels-top">
      <div class="label-top left">До</div>
      <div class="label-top right">После</div>
    </div>
    <div class="before-after-slider">
      <!-- Контейнер с изображениями -->
      <div class="before-after-container" ref="container" @mousedown="onStart" @touchstart="onStart" @click="onClick"
        @dragstart.prevent>
        <img src="/src/assets/before_after_img/before.png" alt="БЫЛО" class="before-image" />
        <img src="/src/assets/before_after_img/after.png" alt="СТАЛО" class="after-image" :style="afterImageStyle" />

        <!-- Линия слайдера -->
        <div class="slider-line" :style="sliderLineStyle"></div>

        <!-- Стрелочки без круга -->
        <div class="slider-arrows" :style="sliderArrowsStyle">
          <span class="arrow-left">‹</span>
          <span class="arrow-right">›</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";

export default {
  name: "BeforeAfterSlider",
  props: {
    initialPosition: {
      type: Number,
      default: 50,
      validator: (value) => value >= 0 && value <= 100,
    },
  },
  emits: ["positionChange"],
  setup(props, { emit }) {
    const container = ref(null);
    const isDragging = ref(false);
    const position = ref(props.initialPosition);

    const afterImageStyle = computed(() => ({
      clipPath: `polygon(${position.value}% 0%, 100% 0%, 100% 100%, ${position.value}% 100%)`,
    }));

    const sliderLineStyle = computed(() => ({
      left: `${position.value}%`,
    }));

    const sliderArrowsStyle = computed(() => ({
      left: `${position.value}%`,
    }));

    const onStart = (e) => {
      isDragging.value = true;
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!isDragging.value || !container.value) return;
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      if (!clientX) return;
      updatePosition(clientX);
      e.preventDefault();
    };

    const onEnd = () => {
      isDragging.value = false;
    };

    const onClick = (e) => {
      if (isDragging.value) return;
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      if (!clientX) return;
      updatePosition(clientX);
    };

    const updatePosition = (clientX) => {
      if (!container.value) return;
      const rect = container.value.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      position.value = percentage;
      emit("positionChange", percentage);
    };

    onMounted(() => {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onMove);
      document.addEventListener("touchend", onEnd);
    });

    onUnmounted(() => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    });

    return {
      container,
      position,
      afterImageStyle,
      sliderLineStyle,
      sliderArrowsStyle,
      onStart,
      onClick,
    };
  },
};
</script>

<style scoped>
.before-after-clean {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
  position: relative;
}

/* Подписи над изображением */
.labels-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 0 20px;
  width: 1024px;
  /* фиксируем ширину */
  max-width: 100vw;
}

.label-top {
  color: white;
  padding: 8px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 8px;

  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1;
}

.label-top.left {
  /* background: linear-gradient(135deg, #ff6b6b, #ee5a52); */
  padding-left: 10px;
}

.label-top.right {
  /* background: linear-gradient(135deg, #4ecdc4, #44a08d); */
}

.before-after-slider {
  width: 1024px;
  height: 512px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Контейнер строго по размеру изображения */
.before-after-container {
  width: 1024px;
  height: 512px;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  position: relative;
}

.before-after-container:active {
  cursor: grabbing;
}

.before-image,
.after-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Тонкая линия слайдера */
.slider-line {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0.9) 100%);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%);
  z-index: 10;
}

/* Стрелочки */
.slider-arrows {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: grab;
  z-index: 15;
  padding: 8px;
}

.slider-arrows:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(0.95);
}

.arrow-left,
.arrow-right {
  color: white;
  font-size: 16px;
  font-weight: bold;
  user-select: none;
  pointer-events: none;
  line-height: 1;
}

.arrow-left {
  margin-right: 2px;
}

.arrow-right {
  margin-left: 2px;
}

.labels-top,
.before-after-slider,
.before-after-container {
  width: 100%;
  max-width: 1024px;
  min-width: 280px;
  margin: 0 auto;
}

.before-after-slider,
.before-after-container {
  aspect-ratio: 2/1;
  height: auto;
  min-height: 180px;
}

@media (max-width: 900px) {

  .labels-top,
  .before-after-slider,
  .before-after-container {
    max-width: 98vw;
  }

  .before-after-slider,
  .before-after-container {
    min-height: 120px;
  }
}

@media (max-width: 600px) {

  .labels-top,
  .before-after-slider,
  .before-after-container {
    max-width: 100vw;
    min-width: 0;
    padding: 0 2vw;
  }

  .before-after-slider,
  .before-after-container {
    min-height: 80px;
  }
}
</style>
