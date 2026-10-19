<template>
  <!-- Верхнее меню. Одинаковое на всех тёмных экранах. -->
  <header class="site-nav">
    <span class="brand">BigDesign</span>
    <nav class="links" aria-label="Main">
      <a v-for="link in links" :key="link.href" :href="link.href">{{ link.label }}</a>
    </nav>
    <a class="join" :href="joinUrl">{{ joinLabel }}</a>
  </header>
</template>

<script>
export default {
  name: "SiteNav",
  props: {
    links: {
      type: Array,
      default: () => [
        { label: "Student works", href: "#works" },
        { label: "CG Arena", href: "#cg-arena" },
        { label: "Ecosystem", href: "#ecosystem" },
        { label: "Reviews", href: "#reviews" },
      ],
    },
    joinLabel: { type: String, default: "Join" },
    joinUrl: { type: String, default: "https://web.tribute.tg/s/Alp" },
  },
};
</script>

<style scoped>
.site-nav {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: clamp(16px, 1.8vw, 28px) clamp(20px, 3.2vw, 56px);
  color: #fff;
  font-family: "Inter", system-ui, sans-serif;
}

.brand {
  font-size: clamp(18px, 1.35vw, 24px);
}

.links {
  display: flex;
  gap: clamp(20px, 3vw, 52px);
  font-size: clamp(13px, 0.9vw, 15px);
}

.links a,
.join {
  color: inherit;
  text-decoration: none;
}

.links a {
  color: rgba(255, 255, 255, 0.85);
  transition: color 0.2s;
}

.links a:hover {
  color: #fff;
}

.join {
  padding: 13px 22px;
  border-radius: 12px;
  background: #fff;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s;
}

.join:hover {
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .links {
    display: none;
  }
}
</style>
