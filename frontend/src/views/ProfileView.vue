<template>
  <div class="profile-container">
    <div class="container">
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p class="loading-text">Carregando perfil...</p>
      </div>

      <div v-else-if="error" class="error-section">
        <h2 class="error-title">Erro ao carregar perfil</h2>
        <p class="error-message">{{ error }}</p>
        <router-link to="/analyze" class="error-button">
          Tentar novamente
        </router-link>
      </div>

      <div v-else-if="profileData" class="profile-content">
        <div class="profile-header">
          <div class="profile-image">
            <img :src="processedProfileImage" :alt="profileData.username" @error="handleImageError">
          </div>
          <div class="profile-info">
            <h1 class="profile-username">@{{ profileData.username }}</h1>
            <p class="profile-name">{{ profileData.fullName }}</p>
            <p class="profile-bio">{{ profileData.bio }}</p>
            
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ formatNumber(profileData.postsCount) }}</span>
                <span class="stat-label">Publicações</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatNumber(profileData.followersCount) }}</span>
                <span class="stat-label">Seguidores</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatNumber(profileData.followingCount) }}</span>
                <span class="stat-label">Seguindo</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link :to="{ name: 'analyze', params: { username: profileData.username }}" class="analyze-button">
            Analisar este perfil
          </router-link>
          <a :href="`https://instagram.com/${profileData.username}`" 
             target="_blank" 
             class="visit-button">
            Ver no Instagram
          </a>
        </div>
        
        <div class="media-preview" v-if="profileData.recentPosts && profileData.recentPosts.length">
          <h2 class="preview-title">Publicações recentes</h2>
          <div class="media-grid">
            <div v-for="(post, index) in profileData.recentPosts" 
                 :key="index" 
                 class="media-item">
              <img :src="post.imageUrl" :alt="`Post ${index + 1}`" class="media-image">
              <div class="media-overlay">
                <div class="media-stats">
                  <span class="likes">❤️ {{ formatNumber(post.likes) }}</span>
                  <span class="comments">💬 {{ formatNumber(post.comments) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-text">Nenhum perfil encontrado. Por favor, tente outro nome de usuário.</p>
        <router-link to="/analyze" class="empty-button">
          Voltar para análise
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'ProfileView',
  data() {
    return {
      profileData: null,
      loading: true,
      error: null,
      imageFallback: '/images/profile-placeholder.svg'
    }
  },
  computed: {
    processedProfileImage() {
      if (!this.profileData || !this.profileData.profilePicture) {
        return this.imageFallback;
      }
      
      // Verificar se é uma URL do Instagram
      if (this.profileData.profilePicture.includes('instagram') && 
          this.profileData.profilePicture.includes('fbcdn.net')) {
        // Remover parâmetros que possam estar causando problemas
        return this.profileData.profilePicture.split('?')[0];
      }
      
      return this.profileData.profilePicture;
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
    handleImageError(e) {
      console.error("Erro ao carregar imagem de perfil");
      e.target.src = this.imageFallback;
    },
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      
      try {
        const username = this.$route.params.username;
        if (!username) {
          throw new Error('Nome de usuário não fornecido');
        }
        
        // Simular recuperação do localStorage para manter a consistência
        // Em um cenário real, você faria uma chamada à API
        const savedData = localStorage.getItem('last_profile_data');
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.username === username) {
            this.profileData = data;
            this.loading = false;
            return;
          }
        }
        
        // Caso não encontrado no localStorage, tentar da API
        // A chamada real seria algo como:
        // const response = await api.getProfile(username);
        // this.profileData = response.data;
        
        // Como é uma demo, vamos simular dados
        setTimeout(() => {
          this.profileData = {
            username: username,
            fullName: 'Nome do Usuário',
            bio: 'Esta é uma bio de exemplo para o perfil de demonstração.',
            profilePicture: 'https://via.placeholder.com/150',
            postsCount: 124,
            followersCount: 5280,
            followingCount: 420,
            recentPosts: [
              { imageUrl: 'https://via.placeholder.com/300', likes: 142, comments: 23 },
              { imageUrl: 'https://via.placeholder.com/300', likes: 98, comments: 15 },
              { imageUrl: 'https://via.placeholder.com/300', likes: 203, comments: 31 },
              { imageUrl: 'https://via.placeholder.com/300', likes: 167, comments: 19 },
              { imageUrl: 'https://via.placeholder.com/300', likes: 88, comments: 12 },
              { imageUrl: 'https://via.placeholder.com/300', likes: 154, comments: 27 }
            ]
          };
          this.loading = false;
        }, 1000);
        
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        this.error = error.message || 'Erro ao carregar o perfil. Tente novamente.';
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchProfile();
  },
  watch: {
    // Se a rota mudar, recarregar o perfil
    '$route.params.username': function(newUsername, oldUsername) {
      if (newUsername !== oldUsername) {
        this.fetchProfile();
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 3rem 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-spinner {
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

.loading-text {
  font-size: 1.2rem;
  color: #666;
}

.error-section {
  text-align: center;
  padding: 3rem 0;
}

.error-title {
  font-size: 1.5rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-message {
  color: #666;
  margin-bottom: 2rem;
}

.error-button, .empty-button {
  display: inline-block;
  background: #E1306C;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.3s ease;
}

.error-button:hover, .empty-button:hover {
  background: #c62b5f;
}

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #E1306C;
  padding: 3px;
  flex-shrink: 0;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-info {
  flex: 1;
}

.profile-username {
  font-size: 1.8rem;
  color: #262626;
  margin: 0 0 0.5rem 0;
}

.profile-name {
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.profile-bio {
  color: #262626;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.profile-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #262626;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.analyze-button, .visit-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 1rem;
}

.analyze-button {
  background: #E1306C;
  color: white;
  border: none;
  flex: 1;
  text-align: center;
}

.visit-button {
  background: transparent;
  color: #262626;
  border: 1px solid #dee2e6;
  flex: 1;
  text-align: center;
}

.analyze-button:hover {
  background: #c62b5f;
}

.visit-button:hover {
  background: #f8f9fa;
}

.media-preview {
  margin-top: 3rem;
}

.preview-title {
  font-size: 1.5rem;
  color: #262626;
  margin-bottom: 1.5rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.media-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 1;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .media-image {
  transform: scale(1.05);
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-stats {
  display: flex;
  justify-content: space-between;
  color: white;
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-text {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 2rem 0;
  }
  
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 