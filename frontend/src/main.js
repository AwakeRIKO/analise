import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configurar interceptadores globais para o axios
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na requisição Axios:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
    return Promise.reject(error);
  }
);

const app = createApp(App)

app.use(router)
app.mount('#app') 