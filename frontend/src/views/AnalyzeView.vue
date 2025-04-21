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
          <img :src="profile.profilePicture" alt="Foto do perfil">
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
      profile: null
    };
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
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.analyze-form-container {
  max-width: 500px;
  margin: 0 auto 2rem;
}

.analyze-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
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
  border-radius: 4px;
  overflow: hidden;
}

.input-prefix {
  background: #eee;
  padding: 0.75rem 0.75rem;
  color: #666;
  border-right: 1px solid #ccc;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  outline: none;
  font-size: 1rem;
}

.btn-analyze {
  padding: 0.75rem 1.5rem;
  background: #405DE6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-analyze:hover {
  background: #3651d8;
}

.loading-container {
  text-align: center;
  margin: 3rem auto;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #405DE6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin: 2rem auto;
  padding: 1rem;
  background: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 4px;
  color: #d32f2f;
  text-align: center;
  max-width: 500px;
}

.btn-reset {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #f5f5f5;
}

.analysis-results {
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #E1306C;
  padding: 3px;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.username {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.bio {
  margin: 0.5rem 0;
  color: #333;
  line-height: 1.4;
}

.profile-link {
  display: inline-block;
  margin-top: 0.75rem;
  color: #405DE6;
  text-decoration: none;
  font-weight: 500;
}

.profile-link:hover {
  text-decoration: underline;
}

.stats-container, .recommendations-container {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
  border-bottom: 2px solid #E1306C;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.recommendation-card {
  position: relative;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-top: 3px solid #405DE6;
}

.recommendation-card h4 {
  margin-top: 0;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.75rem;
}

.recommendation-card p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.rec-priority {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: white;
  border-radius: 0 8px 0 8px;
  font-weight: 600;
}

.rec-priority.alta {
  background: #f44336;
}

.rec-priority.média {
  background: #ff9800;
}

.rec-priority.baixa {
  background: #4CAF50;
}

.no-recommendations {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #666;
}

.analysis-footer {
  margin-top: 2rem;
  text-align: center;
}

.benefits {
  margin-top: 0.75rem;
  border-top: 1px dashed #eee;
  padding-top: 0.75rem;
}

.benefits-title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #555;
}

.benefits-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: #666;
}

.benefits-list li {
  margin-bottom: 0.25rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-image {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }
  
  .stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    min-width: 40%;
  }
  
  .recommendations {
    grid-template-columns: 1fr;
  }
}
</style> 