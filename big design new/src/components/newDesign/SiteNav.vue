<template>
  <!-- Верхнее меню. Одинаковое на всех тёмных экранах; current — раздел, в котором мы сейчас.
       Ссылки #… переключают слайды (их ловит App.vue). -->
  <header class="site-nav">
    <a class="brand" href="#cg-arena">BigDesign</a>
    <nav class="links" aria-label="Main">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        :class="{ 'is-current': link.href === current }"
        :aria-current="link.href === current ? 'true' : null"
      >{{ link.label }}</a>
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
    current: { type: String, default: "" }, // href текущего раздела, например "#works"
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
  color: inherit;
  font-size: clamp(18px, 1.35vw, 24px);
  text-decoration: none;
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

/* Текущий раздел — тонкая линия снизу, без лишнего акцента. */
.links a.is-current {
  color: #fff;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 8px;
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
