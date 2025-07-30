<template >
  <div class="auth-page" id ="personal_account" v-if="isVisible">
    <div class="form-wrapper">
      <h2>Реєстрація на платформі</h2>
      <p class="description">Будь ласка, заповніть форму нижче, щоб створити акаунт.</p>

      <form @submit.prevent="register">
        <input type="text" v-model="form.fullName" placeholder="ПІБ" required />
        <input type="text" v-model="form.instagram" placeholder="Instagram (опціонально)" />
        <input type="text" v-model="form.telegram" placeholder="Telegram" required />
        <input type="email" v-model="form.email" placeholder="Електронна пошта" required />
        <input type="password" v-model="form.password" placeholder="Пароль" required />

        <button type="submit">Зареєструватися</button>
      </form>

      <p class="switch-auth">
        Вже є акаунт?
        <a href="/login">Увійти</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const isVisible = ref(false)

const form = reactive({
  fullName: '',
  instagram: '',
  telegram: '',
  email: '',
  password: ''
})

const register = () => {
  console.log('Дані для реєстрації:', form)
  // Тут буде логіка або запит до API
}

onMounted(() => {
  // Показуємо форму при натисканні на кнопки "Реєстрація" або "Особистий кабінет"
  const triggers = [
    ...document.querySelectorAll('.register-btn'),
    ...document.querySelectorAll('#personal_account')
  ]
  triggers.forEach(el => {
    el.addEventListener('click', () => {
      isVisible.value = true
    })
  })
})
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.form-wrapper {
  max-width: 400px;
  width: 100%;
  padding: 40px;
  background: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

h2 {
  text-align: center;
  margin-bottom: 10px;
}

.description {
  text-align: center;
  font-size: 14px;
  color: #aaa;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #333;
  background-color: #2a2a2a;
  color: white;
  font-size: 15px;
}

input::placeholder {
  color: #777;
}

button {
  padding: 12px;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2563eb;
}

.switch-auth {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.switch-auth a {
  color: #3b82f6;
  text-decoration: none;
}
</style>
