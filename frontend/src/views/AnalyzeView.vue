<template>
  <div class="container">
    <h1 class="page-title">Análise de Perfil do Instagram</h1>
    
    <!-- Formulário de Análise -->
    <div v-if="!profile && !loading" class="analyze-form-container">
      <form @submit.prevent="analyzeProfile" class="analyze-form">
        <div class="form-group">
          <label for="username">Nome de usuário:</label>
          <div class="input-wrapper">
            <span class="input-prefix">@</span>
            <input 
              type="text" 
              id="username" 
              v-model="inputUsername" 
              placeholder="usuário" 
              required
            />
          </div>
        </div>
        <button type="submit" class="btn-analyze">
          Analisar Perfil
        </button>
      </form>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Analisando o perfil... Isso pode levar alguns segundos.</p>
    </div>

    <!-- Mensagem de Erro -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="resetAnalysis" class="btn-reset">Tentar novamente</button>
    </div>

    <!-- Resultados da Análise -->
    <div v-if="profile && !loading" class="analysis-results">
      <div class="profile-header">
        <div class="profile-image">
          <img :src="processedProfileImage" alt="Foto do perfil" @error="handleImageError">
        </div>
        <div class="profile-info">
          <h2>{{ profile.fullName || profile.username }}</h2>
          <p class="username">@{{ profile.username }}</p>
          <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
          <a :href="`https://instagram.com/${profile.username}`" target="_blank" rel="noopener" class="profile-link">
            Ver perfil no Instagram
          </a>
        </div>
      </div>

      <div class="stats-container">
        <h3>Estatísticas do Perfil</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(profile.followersCount) }}</span>
            <span class="stat-label">Seguidores</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(profile.followingCount) }}</span>
            <span class="stat-label">Seguindo</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(profile.postsCount) }}</span>
            <span class="stat-label">Publicações</span>
          </div>
        </div>
      </div>

      <!-- Recomendações da IA -->
      <div class="recommendations-container">
        <h3>Recomendações para Melhorar seu Perfil</h3>
        
        <div v-if="profile.aiAnalysis && Array.isArray(profile.aiAnalysis) && profile.aiAnalysis.length > 0" class="recommendations">
          <div v-for="(rec, index) in profile.aiAnalysis" :key="index" class="recommendation-card">
            <div class="rec-priority" :class="rec.priority ? rec.priority.toLowerCase() : 'média'">
              {{ rec.priority || 'Média' }}
            </div>
            <h4>{{ rec.title }}</h4>
            <p>{{ rec.description }}</p>
            <div v-if="rec.benefits && rec.benefits.length" class="benefits">
              <p class="benefits-title">Benefícios:</p>
              <ul class="benefits-list">
                <li v-for="(benefit, i) in rec.benefits" :key="i">{{ benefit }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div v-else class="no-recommendations">
          <p>Não foi possível gerar recomendações específicas para este perfil.</p>
        </div>
      </div>

      <div class="analysis-footer">
        <button @click="resetAnalysis" class="btn-reset">Nova Análise</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AnalyzeView',
  data() {
    return {
      inputUsername: '',
      loading: false,
      error: null,
      profile: null,
      imageFallback: '/images/profile-placeholder.svg'
    };
  },
  computed: {
    processedProfileImage() {
      if (!this.profile || !this.profile.profilePicture) {
        return this.imageFallback;
      }
      
      // Verificar se é uma URL do Instagram
      if (this.profile.profilePicture.includes('instagram') && 
          this.profile.profilePicture.includes('fbcdn.net')) {
        // Remover parâmetros que possam estar causando problemas
        return this.profile.profilePicture.split('?')[0];
      }
      
      return this.profile.profilePicture;
    }
  },
  methods: {
    async analyzeProfile() {
      if (!this.inputUsername) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const cleanUsername = this.inputUsername.trim().replace('@', '');
        console.log(`[LOG] Iniciando análise para: ${cleanUsername}`);
        
        console.log('[LOG] Enviando requisição ao backend...');
        const response = await axios.get(`/api/profile/${cleanUsername}`);
        
        console.log('[LOG] Resposta recebida do backend');
        
        if (response.data) {
          console.log('[LOG] Dados válidos recebidos:', response.data.username);
          
          // Definir dados diretamente no localStorage
          localStorage.setItem('last_analysis_result', JSON.stringify(response.data));
          
          // Mostrar diretamente os resultados nesta página em vez de redirecionar
          this.profile = response.data;
          this.loading = false;
          
          // Scroll para os resultados
          setTimeout(() => {
            const resultsElement = document.querySelector('.analysis-results');
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        } else {
          console.error('[ERRO] Resposta do backend sem dados válidos');
          this.error = 'Formato de resposta inválido';
          this.profile = null;
        }
      } catch (err) {
        console.error('[ERRO] Falha na análise:', err);
        this.error = err.response?.data?.error || 
                     'Erro ao conectar com o servidor. Por favor, tente novamente.';
        this.profile = null;
      } finally {
        this.loading = false;
      }
    },
    resetAnalysis() {
      this.profile = null;
      this.error = null;
      this.inputUsername = '';
    },
    formatNumber(num) {
      if (!num && num !== 0) return '0';
      
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      } else {
        return num.toString();
      }
    },
    handleImageError(e) {
      console.error("Erro ao carregar imagem de perfil");
      e.target.src = this.imageFallback;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  text-align: center;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: #333;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
}

.analyze-form-container {
  max-width: 500px;
  margin: 0 auto 1.5rem;
}

.analyze-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #555;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 1rem;
}

.input-prefix {
  color: #666;
  margin-right: 0.5rem;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
}

.btn-analyze {
  background: #E1306C;
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-analyze:hover {
  background: #c62b5f;
}

/* Estilos para resultados da análise */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

@media (min-width: 640px) {
  .profile-header {
    flex-direction: row;
    text-align: left;
    padding: 1.5rem;
  }
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .profile-image {
    margin-right: 1.5rem;
    margin-bottom: 0;
  }
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info h2 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.username {
  color: #666;
  margin-bottom: 0.75rem;
}

.bio {
  margin-bottom: 1rem;
  line-height: 1.4;
}

.profile-link {
  display: inline-block;
  background: #f3f3f3;
  color: #555;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.profile-link:hover {
  background: #e5e5e5;
}

.stats-container {
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.stats-container h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  text-align: center;
}

.stats {
  display: flex;
  justify-content: space-between;
  text-align: center;
}

.stat-item {
  flex: 1;
  padding: 0 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #E1306C;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}

/* Recomendações */
.recommendations-container {
  margin-bottom: 2rem;
}

.recommendations-container h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  text-align: center;
}

.recommendations {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .recommendations {
    grid-template-columns: repeat(2, 1fr);
  }
}

.recommendation-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.rec-priority {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
}

.rec-priority.alta {
  background: #e74c3c;
}

.rec-priority.média {
  background: #f39c12;
}

.rec-priority.baixa {
  background: #3498db;
}

.recommendation-card h4 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  padding-right: 4rem;
}

.recommendation-card p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.benefits-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #444;
}

.benefits-list {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.benefits-list li {
  margin-bottom: 0.25rem;
  color: #666;
}

/* Botões e loader */
.btn-reset {
  background: #f3f3f3;
  color: #666;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-reset:hover {
  background: #e5e5e5;
}

.loading-container {
  text-align: center;
  padding: 2rem 0;
}

.loader {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #E1306C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fff5f5;
  border-left: 4px solid #e74c3c;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #c0392b;
}

.analysis-footer {
  text-align: center;
  margin-top: 2rem;
}

/* Tela de resultados */
.analysis-results {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 