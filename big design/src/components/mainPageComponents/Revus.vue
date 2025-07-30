<template>
  <section class="testimonials">
    <div class="section-title">
        <h2 class="section-title-text">Отзывы учеников</h2>
    </div>
    
    <div class="testimonials-grid">
      <div
        v-for="(testimonial, index) in testimonials"
        :key="index"
        class="testimonial-card"
      >
        <div class="testimonial-header">
            <img
              :src="testimonial.avatar"
              alt="user avatar"
              class="testimonial-avatar"
            />
            <div>
              <h3 class="testimonial-name">{{ testimonial.name }}</h3>
              <p class="testimonial-date">{{ testimonial.date }}</p>
            </div>
        </div>
        <div class="testimonial-content">
          
          <div class="testimonial-tag-wrapper">
            <span class="testimonial-tag">
              {{ testimonial.tag }}
            </span>
          </div>
          <p class="testimonial-text">
            {{ testimonial.text }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  {
    name: 'Иван Новиков',
    date: '20 июл 2023',
    tag: 'Выгодный комплект',
    avatar: 'https://placehold.co/60x60',
    text: `Лучший курс что когда-либо проходил. Настолько интересных и крутых работ я ещё не обучался делать. Самое главное, Лёшу слушать было очень приятно, что просто сидишь и с кайфом делаешь. Всем советую! Я прошёл всё за 2 месяца, купив полный пакет, сделал много работ и упаковал их в один шоурил. Как же кайфую от этих работ. И теперь могу с этим скиллом и своим полётом фантазии делать разные проекты. Лёша, спасибо тебе.`
  },
  {
    name: 'Алишан',
    date: '28 мар 2023',
    tag: 'VFX Designer',
    avatar: 'https://placehold.co/60x60',
    text: `Вообще не пожалел, что купил! Внутри курса затрагиваются все темы и уроки для создания VFX и крутых роликов. Алексей всё объясняет доходчиво — можно научиться всему за короткое время. 

Курс подойдет как для новичков, так и для опытных. 
Советую однозначно, курс очень полезный, и практичный!`
  },
  {
    name: 'Аят Фаралеков',
    date: '24 апр 2025',
    tag: 'Blender 3D: Generalist',
    avatar: 'https://placehold.co/60x60',
    text: `Спасибо за курс. Я самоучка, около года занимался по ютубу. Blender 3D: Generalist — первый купленный мной курс. 

Стоит брать, чтобы систематизировать знания. Без воды. Плюс курса — его разнообразие: почти все направления в 3D и монтаже, чтобы понять, куда двигаться дальше.`
  },
  {
    name: 'Александр Акимов',
    date: '25 апр 2023',
    tag: 'Удобный комплект',
    avatar: 'https://placehold.co/60x60',
    text: `Прохожу курс Blender Generalist — очень нравится подача материала и точечное объяснение. Советую проходить модули по порядку — после второго модуля уже спокойно выполняю задачи как по нотам.

Цена — космос.
Поддержка — на связи 90% времени.
Выход — получил первый заказ после прохождения первого модуля. (Да, не без помощи Алексея 🥲)`
  },
  {
    name: 'Пятый Ученик',
    date: '01 янв 2024',
    tag: 'Extra Example',
    avatar: 'https://placehold.co/60x60',
    text: `Добавлен пятый отзыв, чтобы проверить перенос на новую строку. Всё должно быть аккуратно.`
  },
];
</script>

<style scoped>
.testimonials {
  margin: 3rem auto;
  max-width: 1280px;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  align-self:flex-start; 
    display: inline-block;
  border-width: 0px;
    border-radius: 3000px 3000px 3000px 3000px;
    background-image: linear-gradient(0.488turn, rgba(97, 68, 117, 0.44) 0%, rgba(255, 255, 255, 0) 100%);
    border-color: transparent;
    border-style: solid;
}
.section-title-text {
    display: inline-block;
    padding: 0.75rem 2rem;
    background-image: linear-gradient(0.488turn, rgba(97, 68, 117, 0.44) 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 3000px 3000px 3000px 3000px;
  vertical-align: middle;
    color: #f8f8f8;
    font-size:2.5rem;
    font-family: 'Arial', Arial, sans-serif;
    line-height: 1;
    font-weight: 600;
    letter-spacing: -1.5px;
    background-position: center center;
    border-color: transparent;
    border-style: solid;
}    
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

.testimonial-card {
  background-image: linear-gradient(0.831turn, rgba(0, 0, 0, 0) 0%, rgba(46, 53, 77, 1) 100%);
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  /* padding: 1.5rem; */
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.testimonial-header {
  background-color: #272b37;
  border-bottom: #1c1c2d 1px solid;
  border-radius:1.5rem 1.5rem 0 0 ;
  padding: 0.5rem;
  display: flex;
  gap: 1rem;
  /* margin-bottom: 1rem; */
  align-items: center;
}

.testimonial-avatar {
  width: 60px;
  height: 60px;
  border-radius: 9999px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
}

.testimonial-name {
  font-family: 'Arial', Arial, sans-serif;
  vertical-align: middle;
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.testimonial-date {
  font-size: 0.75rem;
  color: #ccc;
  margin: 0;
}
.testimonial-content {
    padding: 0.75rem;
}
.testimonial-tag-wrapper {
    padding-bottom: 0.25rem;
  margin-bottom: 0.5rem;
    display: inline-block;
  border-radius: 30px 30px 30px 30px;
    background-image: linear-gradient(0.932turn, rgba(26, 36, 56, 1) 0%, rgba(59, 71, 93, 1) 100%);
    border-color: transparent;
    
}

.testimonial-tag {
  /* background-color: #2E3A59; */
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;

  vertical-align: middle;
        white-space: normal;
        font-size: 14px;
        background-size: cover;
  
}

.testimonial-text {
  vertical-align: middle;
        white-space: normal;
        font-size: 14px;
        background-size: cover;
    color: #ffffff;
    /* font-size: 15px; */
    font-family: 'TildaSans',Arial,sans-serif;
    line-height: 18px;
    font-weight: 100;
    background-position: center center;
    border-color: transparent;
    border-style:dashed;
}
</style>
