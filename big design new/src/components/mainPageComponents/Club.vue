<template>
    <section id="personal_account">
        <div class="club-section">
            <div class="section-title">
                <h2 class="section-title-text">CG Arena</h2>
            </div>
            <div class="center-btn-wrap" @mouseenter="fly = true" @mouseleave="fly = false">
                <button class="main-btn" @click="goToTelegram">
                    <span>присоединиться</span>
                </button>
                <!-- <button v-if="!isMobile" :class="['fly-btn', 'fly-btn-1', { fly }]">
                    <img src="/logo_forClab/logo1.png" alt="Photoshop" class="logo-icon" />
                </button>
                <button v-if="!isMobile" :class="['fly-btn', 'fly-btn-2', { fly }]">
                    <img src="/logo_forClab/logo2.jpg" alt="Illustrator" class="logo-icon" />
                </button>
                <button v-if="!isMobile" :class="['fly-btn', 'fly-btn-3', { fly }]">
                    <img src="/logo_forClab/logo3.png" alt="InDesign" class="logo-icon" />
                </button>
                <button v-if="!isMobile" :class="['fly-btn', 'fly-btn-4', { fly }]">
                    <img src="/logo_forClab/logo4.png" alt="CorelDRAW" class="logo-icon" />
                </button> -->
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
const fly = ref(false);
const isMobile = ref(window.innerWidth <= 600);

function handleResize() {
    isMobile.value = window.innerWidth <= 600;
}

function goToTelegram() {
    window.open('https://web.tribute.tg/s/Alp', '_blank');
}

onMounted(() => {
    window.addEventListener('resize', handleResize);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.club-section {
    max-width: 1288px;
    margin: 0 auto;
    padding: 32px 16px 48px 16px;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.section-title {
    text-align: left;
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

.center-btn-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 48px;
    margin-bottom: 48px;
    width: 100%;
    min-height: 180px;
}

.main-btn {
    z-index: 2;
    position: relative;
}

button,
.fly-btn {
    all: unset;
    position: absolute;
    height: 4em;
    width: 25em;
    max-width: 100%;
    padding: 8px 24px;
    border-radius: 10px;
    background: linear-gradient(180deg, #282828, #202020);
    box-shadow: inset -8px 0 8px rgba(0, 0, 0, 0.15),
        inset 0 -8px 8px rgba(0, 0, 0, 0.25),
        0 0 0 2px rgba(0, 0, 0, 0.75),
        10px 20px 25px rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.7s cubic-bezier(.68, -0.55, .27, 1.55), opacity 0.7s;
}

button::before,
.fly-btn::before {
    content: "";
    position: absolute;
    top: 3px;
    left: 4px;
    bottom: 14px;
    right: 12px;
    background: linear-gradient(90deg, #232323, #4a4a4a);
    border-radius: 10px;
    box-shadow: -10px -10px 10px rgba(255, 255, 255, 0.25),
        10px 5px 10px rgba(0, 0, 0, 0.15);
    border-left: 1px solid #0004;
    border-bottom: 1px solid #0004;
    border-top: 1px solid #0009;
    pointer-events: none;
}

.logo-icon {
    width: 2.5em;
    height: 2.5em;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    filter: drop-shadow(0 2px 8px #0008);
}

button span,
.fly-btn span {
    font-size: 1.5rem;
    color: white;
    position: relative;
    margin-top: -8px;
    z-index: 1;
}

/* Desktop (по умолчанию) */
.fly-btn-1 {
    width: 8em;
    left: 10em;
    top: -2em;
    transform: rotate(-14deg);
}

.fly-btn-2 {
    width: 6em;
    left: 50em;
    top: -4em;
    transform: rotate(16deg);
}

.fly-btn-3 {
    width: 10em;
    left: 15em;
    top: 12em;
    transform: rotate(10deg);
}

.fly-btn-4 {
    width: 4em;
    left: 46em;
    top: 10em;
    transform: rotate(-5deg);
}

/* Анимация разлёта */
.fly-btn-1.fly {
    transform: translate(-50px, -10px) rotate(-24deg) scale(1.08);
}

.fly-btn-2.fly {
    transform: translate(10px, -50px) rotate(24deg) scale(1.08);
}

.fly-btn-3.fly {
    transform: translate(-50px, 10px) rotate(18deg) scale(1.08);
}

.fly-btn-4.fly {
    transform: translate(60px, 50px) rotate(-12deg) scale(1.08);
}

/* Адаптив для ноутбуков */
@media (max-width: 1200px) {
    .fly-btn-1 {
        left: 6em;
        top: -2em;
    }

    .fly-btn-2 {
        left: 40em;
        top: -4em;
    }

    .fly-btn-3 {
        left: 8em;
        top: 8em;
    }

    .fly-btn-4 {
        left: 45em;
        top: 8em;
    }

    .fly-btn-1.fly {
        transform: translate(-60px, -40px) rotate(-24deg) scale(1.08);
    }

    .fly-btn-2.fly {
        transform: translate(20px, -60px) rotate(24deg) scale(1.08);
    }

    .fly-btn-3.fly {
        transform: translate(-60px, 40px) rotate(18deg) scale(1.08);
    }

    .fly-btn-4.fly {
        transform: translate(20px, 60px) rotate(-32deg) scale(1.08);
    }
}

/* Адаптив для планшетов */
@media (max-width: 900px) {
    .fly-btn-1 {
        left: 0em;
        top: -2em;
    }

    .fly-btn-2 {
        left: 30em;
        top: -4em;
    }

    .fly-btn-3 {
        left: 3em;

    }

    .fly-btn-4 {
        left: 30em;
        top: 9em;
    }

    .fly-btn-1.fly {
        transform: translate(-40px, -40px) rotate(-24deg) scale(1.08);
    }

    .fly-btn-2.fly {
        transform: translate(20px, -60px) rotate(24deg) scale(1.08);
    }

    .fly-btn-3.fly {
        transform: translate(-40px, 40px) rotate(18deg) scale(1.08);
    }

    .fly-btn-4.fly {
        transform: translate(20px, 60px) rotate(-32deg) scale(1.08);
    }
}

/* Адаптив для телефонов */
@media (max-width: 600px) {
    .center-btn-wrap {
        min-height: 120px;
        flex-direction: column;
        gap: 12px;
    }

    .main-btn {
        width: 100%;
        min-width: 0;
        font-size: 1rem;
        height: 3em;
        padding: 6px 12px;
        position: static;
        left: 0;
        top: 0;
        margin-bottom: 8px;
    }

    .fly-btn {
        display: none !important;
    }
}
</style>