<template>
  <!-- Мелкие подписи у края экрана. Класс reveal нужен родителю: он анимирует их появление. -->
  <ul class="labels" :class="{ 'is-right': align === 'right' }" aria-hidden="true">
    <li v-for="item in items" :key="item" class="reveal">{{ item }}</li>
    <li class="dash reveal"></li>
  </ul>
</template>

<script>
export default {
  name: "SideLabels",
  props: {
    items: { type: Array, required: true },
    align: { type: String, default: "left" }, // "left" | "right"
  },
};
</script>

<style scoped>
.labels {
  position: absolute;
  top: 33%;
  left: clamp(20px, 3.4vw, 60px);
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.labels.is-right {
  right: clamp(20px, 3.4vw, 60px);
  left: auto;
}

.dash {
  width: 32px;
  height: 1px;
  margin-top: 18px;
  background: currentColor;
}

@media (max-width: 900px) {
  .labels {
    display: none;
  }
}
</style>
