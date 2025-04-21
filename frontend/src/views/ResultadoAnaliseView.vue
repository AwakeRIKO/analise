<template>
  <div class="container">
    <div v-if="!profileData" class="loading-message">
      <p>Nenhum resultado disponível. Por favor, faça uma análise primeiro.</p>
      <router-link to="/analyze" class="btn-back">Fazer Análise</router-link>
    </div>

    <div v-else class="results-container">
      <!-- Cabeçalho do Perfil -->
      <div class="profile-header">
        <div class="profile-image">
          <img :src="profileData.profilePicture" :alt="profileData.username">
        </div>
        <div class="profile-info">
          <h1>Análise do Perfil @{{ profileData.username }}</h1>
          <p class="full-name">{{ profileData.fullName }}</p>
          <p class="bio">{{ profileData.bio }}</p>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section">
        <h2>Estatísticas do Perfil</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(profileData.followersCount) }}</div>
            <div class="stat-label">Seguidores</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(profileData.followingCount) }}</div>
            <div class="stat-label">Seguindo</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(profileData.postsCount) }}</div>
            <div class="stat-label">Publicações</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ calculateEngagement }}%</div>
            <div class="stat-label">Taxa de Engajamento</div>
          </div>
        </div>
      </div>

      <!-- Recomendações -->
      <div class="recommendations-section">
        <h2>Recomendações de Melhoria</h2>
        <div class="recommendations-grid">
          <div v-for="(rec, index) in profileData.aiAnalysis" 
               :key="index" 
               class="recommendation-card"
               :class="rec.priority.toLowerCase()">
            <div class="rec-priority">{{ rec.priority }}</div>
            <h3>{{ rec.title }}</h3>
            <p class="rec-description">{{ rec.description }}</p>
            <div class="benefits">
              <h4>Benefícios Esperados:</h4>
              <ul>
                <li v-for="(benefit, i) in rec.benefits" :key="i">
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="action-buttons">
        <router-link to="/analyze" class="btn-secondary">Nova Análise</router-link>
        <button @click="downloadPDF" class="btn-primary">Baixar Relatório PDF</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultadoAnaliseView',
  data() {
    return {
      profileData: null
    }
  },
  computed: {
    calculateEngagement() {
      if (!this.profileData) return '0';
      const engagement = ((this.profileData.followersCount * 0.1) / this.profileData.postsCount).toFixed(2);
      return engagement > 0 ? engagement : '0.00';
    }
  },
  methods: {
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
    downloadPDF() {
      // Implementar geração de PDF aqui
      alert('Função de download do relatório em PDF será implementada em breve!');
    }
  },
  created() {
    console.log('[LOG] ResultadoAnaliseView criado');
    
    // Verificar se a página está sendo carregada corretamente
    console.log('[LOG] URL atual:', window.location.href);
    
    // Tentar recuperar os dados da análise do localStorage
    console.log('[LOG] Buscando dados no localStorage...');
    const savedAnalysis = localStorage.getItem('last_analysis_result');
    
    if (savedAnalysis) {
      console.log('[LOG] Dados encontrados no localStorage');
      try {
        const data = JSON.parse(savedAnalysis);
        console.log('[LOG] Dados parseados com sucesso:', data.username);
        this.profileData = data;
        
        // Verificar se as recomendações estão presentes
        if (this.profileData.aiAnalysis) {
          console.log('[LOG] Recomendações encontradas:', 
            Array.isArray(this.profileData.aiAnalysis) ? 
            `${this.profileData.aiAnalysis.length} recomendações` : 
            'Formato não esperado');
        } else {
          console.warn('[AVISO] Nenhuma recomendação encontrada nos dados');
        }
      } catch (e) {
        console.error('[ERRO] Falha ao processar dados salvos:', e);
      }
    } else {
      console.warn('[AVISO] Nenhum dado encontrado no localStorage');
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-message {
  text-align: center;
  padding: 3rem;
}

.results-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: center;
}

.profile-image {
  width: 150px;
  height: 150px;
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

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: #262626;
}

.full-name {
  font-size: 1.2rem;
  color: #666;
  margin: 0.5rem 0;
}

.bio {
  color: #262626;
  line-height: 1.5;
  margin: 0.5rem 0;
}

.stats-section {
  margin: 3rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 1rem;
}

.recommendations-section {
  margin: 3rem 0;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.recommendation-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.recommendation-card.alta {
  border-top: 4px solid #dc3545;
}

.recommendation-card.média {
  border-top: 4px solid #ffc107;
}

.recommendation-card.baixa {
  border-top: 4px solid #28a745;
}

.rec-priority {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.alta .rec-priority {
  background: #dc3545;
  color: white;
}

.média .rec-priority {
  background: #ffc107;
  color: #000;
}

.baixa .rec-priority {
  background: #28a745;
  color: white;
}

.recommendation-card h3 {
  margin: 0 0 1rem 0;
  color: #262626;
  padding-right: 100px;
}

.rec-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.benefits {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.benefits h4 {
  margin: 0 0 0.75rem 0;
  color: #262626;
  font-size: 1rem;
}

.benefits ul {
  margin: 0;
  padding-left: 1.25rem;
}

.benefits li {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #E1306C;
  color: white;
  border: none;
}

.btn-secondary {
  background: #f8f9fa;
  color: #262626;
  border: 1px solid #dee2e6;
}

.btn-primary:hover {
  background: #c62b5f;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-back {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #E1306C;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-image {
    margin: 0 auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style> 