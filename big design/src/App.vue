<template>
  <section class="header">
    <div class="hero-section">
        <nav class="navbar">
            <div class="logo">BigDesign</div>
            <ul class="nav-links">
                <li><a href="#">Роботи учнів</a></li>
                <li><a href="#">Тарифи</a></li>
                <li><a href="#">Етапи навчання</a></li>
                <li><a href="#">Зворотній зв'язок</a></li>
            </ul>
            <button class="register-btn">Реєстрація</button>
        </nav>
        <div class = "header info ">
            <h1 class="main-title">BigDesign<br>первая VFX/CGI-платформа в СНГ</h1>
            <p class="subtext">Наша миссия — раскрыть потенциал молодых художников, обучая современным CGI-технологиям.  
  Мы объединяем комьюніті, которого раньше не существовало.</p>
        </div>
    </div>

    <div class="next-section" id="next">
        <h2>Тут будуть роботи учнів)</h2>
        <p>Додам скрол перелік</p>
    </div>
  </section>
</template>

<script>
import heroBg from './assets/HeaderImg.avif'

export default {
  data() {
    return {
      heroBackground: `url(${heroBg})`
    }
  }
}
</script>

<style scoped>
.navbar {
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:15px 0;
  color: white;
}
.navbar:hover{
    transition: all 0.3s ease;
 background: #111; 
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  text-decoration: underline;
}

.register-btn {
  background-color: white;
  color: #111;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.register-btn:hover {
  background-color: #f3f3f3;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.header.info {
  max-width: 700px;
  padding-left: 3rem;
  padding-top: 5rem;
  color: white;
  text-align: left;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.subtext {
  font-size: 1.125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  max-width: 600px;
}
</style>



















<!-- <template>
  <h3>{{ header }}</h3>
  <p > {{ someInfo }}</p>
  
  <button type="button" @click="showUserInfo()"> Показать пользовательскую инфу </button>
  <button type="button" @click="userUp()" >Отправить</button>
  <input type="text" v-model="userText" placeholder="Текст">
  <input type="name" v-model="userName" placeholder="Ім'я">
  <input type="pasword" v-model="userPasword" placeholder="Пароль">
  <User v-for="(el, index) in userInfo" :user = "el" :index = "index" :deleteUser ="deleteUser"/>
  <div v-if="userInfo.length == 0">
    NON
  </div>         

  <div v-else-if="userInfo.length == 1">
    Only 1
  </div>     
  <div v-else>
    More 1
  </div>    
</template>
            -->


<!-- <style scoped>
h3{
    color: rgb(78, 3, 43);
}
</style> -->
<!-- <script >
import User from './components/User.vue';
    export default{
        components:{User},
        data(){
            return{
                userInfo:[],
                header:"hello worldDDDDDDDDD",
                someInfo:"info",
                userText:"",
                userName:"",
                userPasword:""
            }
        },
        methods:{
            userUp(word='Nex text'){
               this.someInfo = word;
            },
            showUserInfo(){
                this.userInfo.push({
                    name: this.userName,
                    pass: this.userPasword,
                    text: this.userText
                })

            },
            deleteUser(index){
                this.userInfo.splice(index, 1);
            }
        }
    }
</script> -->
