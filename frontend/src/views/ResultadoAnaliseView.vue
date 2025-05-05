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
          <img :src="processedProfileImage" :alt="profileData.username" @error="handleImageError">
        </div>
        <div class="profile-info">
          <h1>Análise do Perfil @{{ profileData.username }}</h1>
          <p class="full-name">{{ profileData.fullName }}</p>
          <p class="bio">{{ profileData.bio }}</p>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-section">
        <h2>Dados e Estatísticas</h2>
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

      <!-- Análise da Bio -->
      <div class="bio-analysis-section" v-if="profileData.detailedAnalysis && profileData.detailedAnalysis.bioAnalysis">
        <h2>Análise da Bio</h2>
        <div class="bio-score">
          <span class="score-label">Pontuação da Bio:</span>
          <div class="score-circles">
            <span v-for="n in 5" :key="n" class="circle" 
                  :class="n <= profileData.detailedAnalysis.bioAnalysis.score ? 'filled' : ''"></span>
          </div>
          <span class="score-text">{{ profileData.detailedAnalysis.bioAnalysis.scoreText }}</span>
        </div>
        
        <div class="bio-details">
          <div class="bio-strengths">
            <h3>Pontos fortes:</h3>
            <ul class="strengths-list">
              <li v-for="(strength, i) in profileData.detailedAnalysis.bioAnalysis.strengths" :key="i" class="strength-item">
                <span class="check-icon">✓</span> {{ strength }}
              </li>
            </ul>
          </div>
          
          <div class="bio-weaknesses">
            <h3>O que pode melhorar:</h3>
            <ul class="weaknesses-list">
              <li v-for="(weakness, i) in profileData.detailedAnalysis.bioAnalysis.weaknesses" :key="i" class="weakness-item">
                <span class="x-icon">✗</span> {{ weakness }}
              </li>
            </ul>
          </div>
        </div>

        <div class="bio-tip">
          <span class="tip-icon">💡</span>
          <p>A bio foi analisada e melhorada para incluir um nicho claro, call-to-action e informações de contato para engajar mais os seguidores.</p>
        </div>
      </div>

      <!-- Insights Analíticos Avançados -->
      <div class="insights-section">
        <h2>Insights Analíticos Avançados</h2>
        
        <div class="insights-grid">
          <!-- Potencial de Crescimento -->
          <div class="insight-card growth-potential">
            <h3>Potencial de Crescimento</h3>
            <div class="score-badge">Bom</div>
            <div class="score-bar">
              <div class="score-progress" 
                   :style="`width: ${getPotentialScore()}%`">
              </div>
            </div>
            <div class="score-text">{{ getPotentialScore() }}/100</div>
            <p class="insight-description">
              Seu perfil tem bom potencial de crescimento. Ajustes específicos podem ajudar a atingir um crescimento ainda melhor.
            </p>
          </div>
          
          <!-- Proporção Seguidores/Seguindo -->
          <div class="insight-card follow-ratio">
            <h3>Proporção Seguidores/Seguindo</h3>
            <div class="score-badge">Excelente</div>
            <p class="ratio-text">
              Proporção: {{ calculateFollowRatio() }}
            </p>
            <p class="insight-description">
              Sua conta demonstra grande autoridade no nicho. Considere estratégias para monetização.
            </p>
          </div>

          <!-- Taxa de Engajamento -->
          <div class="insight-card engagement-rate">
            <h3>Taxa de Engajamento</h3>
            <div class="score-badge">{{ getEngagementRating() }}</div>
            <div class="score-bar">
              <div class="score-progress" 
                  :style="`width: ${Math.min(parseFloat(calculateEngagement) * 5, 100)}%`"
                  :class="getEngagementColorClass()">
              </div>
            </div>
            <div class="score-text">{{ calculateEngagement }}%</div>
            <p class="insight-description">
              {{ getEngagementDescription() }}
            </p>
          </div>

          <!-- Posicionamento de Nicho -->
          <div class="insight-card niche-position">
            <h3>Posicionamento de Nicho</h3>
            <div class="score-badge">{{ getNichePositionRating() }}</div>
            <p class="position-text">
              {{ getNichePosition() }}
            </p>
            <p class="insight-description">
              {{ getNichePositionDescription() }}
            </p>
          </div>

          <!-- Alcance Estimado -->
          <div class="insight-card estimated-reach">
            <h3>Alcance Estimado</h3>
            <div class="score-badge">Médio</div>
            <div class="reach-value">{{ getEstimatedReach() }}</div>
            <p class="insight-description">
              Este é o número estimado de contas únicas que suas publicações alcançam por semana.
            </p>
          </div>

          <!-- Qualidade de Conteúdo -->
          <div class="insight-card content-quality">
            <h3>Qualidade de Conteúdo</h3>
            <div class="score-badge">{{ getContentQualityRating() }}</div>
            <div class="score-bar">
              <div class="score-progress" 
                   :style="`width: ${getContentQualityScore()}%`">
              </div>
            </div>
            <div class="score-text">{{ getContentQualityScore() }}/100</div>
            <p class="insight-description">
              {{ getContentQualityDescription() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Projeções de Crescimento -->
      <div class="projections-section">
        <h2>Projeções de Crescimento</h2>
        <div class="projections-grid">
          <div class="projection-card">
            <div class="projection-period">3 Meses</div>
            <div class="projection-value">{{ formatNumber(Math.round(profileData.followersCount * 1.15)) }}</div>
            <div class="projection-label">seguidores</div>
          </div>
          
          <div class="projection-card">
            <div class="projection-period">6 Meses</div>
            <div class="projection-value">{{ formatNumber(Math.round(profileData.followersCount * 1.35)) }}</div>
            <div class="projection-label">seguidores</div>
          </div>
          
          <div class="projection-card">
            <div class="projection-period">12 Meses</div>
            <div class="projection-value">{{ formatNumber(Math.round(profileData.followersCount * 1.8)) }}</div>
            <div class="projection-label">seguidores</div>
          </div>
        </div>
        <p class="projections-note">
          *Projeções baseadas em padrões de crescimento orgânico para perfis similares com conteúdo consistente.
        </p>
      </div>

      <!-- Serviços Recomendados -->
      <div class="services-section">
        <h2>Serviços Recomendados</h2>
        
        <div class="services-intro">
          <h3 class="services-title">Serviços Recomendados para Seu Perfil</h3>
          <p class="services-description">
            Com base na análise do seu perfil @{{ profileData.username }}, identificamos os seguintes serviços que podem potencializar seus resultados:
          </p>
        </div>
        
        <div class="service-card">
          <div class="service-info">
            <h4 class="service-name">{{ getRecommendedFollowers() }} Seguidores</h4>
            <p class="service-description">
              Com sua atual base de seguidores, este pacote proporcionará um crescimento substancial que pode ajudar a atingir o patamar de micro-influenciador.
            </p>
          </div>
          <div class="service-price-section">
            <div class="service-price">R$ {{ getFollowersPrice() }}</div>
            <button class="service-button">Solicitar</button>
          </div>
        </div>
        
        <div class="service-footer">
          <h4>Todos os Serviços Disponíveis</h4>
        </div>
      </div>

      <!-- Recomendações -->
      <div class="recommendations-section">
        <h2>Recomendações de Melhoria</h2>
        <div class="recommendations-grid">
          <div v-for="(rec, index) in getRecommendations()" 
               :key="index" 
               class="recommendation-card"
               :class="rec.priority.toLowerCase()">
            <div class="rec-priority">{{ rec.priority }}</div>
            <h3>{{ rec.title }}</h3>
            <p class="rec-description">{{ rec.description }}</p>
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
      profileData: null,
      loadingRecommendations: false,
      recommendationsError: null,
      imageFallback: '/images/profile-placeholder.svg'
    }
  },
  computed: {
    calculateEngagement() {
      if (!this.profileData) return '0.0';
      
      const engagement = this.profileData.engagementRate ? 
        (this.profileData.engagementRate * 100).toFixed(1) : '2.5';
      
      return engagement;
    },
    getPotentialScore() {
      // Se tivermos os dados detalhados, use-os
      if (this.profileData && this.profileData.detailedAnalysis && this.profileData.detailedAnalysis.insights) {
        return this.profileData.detailedAnalysis.insights.growthPotential.score;
      }
      
      // Caso contrário, calcule com base nos dados básicos
      const followers = this.profileData.followersCount || 0;
      const following = this.profileData.followingCount || 0;
      const posts = this.profileData.postsCount || 0;
      
      // Base score
      let score = 60;
      
      // Ajuste baseado em posts
      if (posts > 100) score += 10;
      else if (posts > 50) score += 5;
      else if (posts < 10) score -= 10;
      
      // Ajuste baseado em seguidores
      if (followers > 10000) score += 15;
      else if (followers > 5000) score += 10;
      else if (followers > 1000) score += 5;
      
      // Ajuste baseado na razão seguidores/seguindo
      const ratio = following > 0 ? followers / following : 0;
      if (ratio > 2) score += 10;
      else if (ratio > 1) score += 5;
      else if (ratio < 0.5) score -= 5;
      
      return Math.max(0, Math.min(100, score));
    },
    calculateFollowRatio() {
      if (!this.profileData || !this.profileData.followersCount || !this.profileData.followingCount) return '0';
      const ratio = (this.profileData.followersCount / this.profileData.followingCount).toFixed(1);
      return ratio > 0 ? ratio : '0.0';
    },
    getRecommendedFollowers() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      
      // Recomenda pacotes baseados na quantidade atual de seguidores
      if (currentFollowers < 1000) {
        return "2.000 a 2.300";
      } else if (currentFollowers < 5000) {
        return "5.000";
      } else if (currentFollowers < 10000) {
        return "10.000";
      } else {
        return "30.000";
      }
    },
    getFollowersPrice() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      
      // Preços baseados na quantidade atual de seguidores
      if (currentFollowers < 1000) {
        return "129.90";
      } else if (currentFollowers < 5000) {
        return "289.90";
      } else if (currentFollowers < 10000) {
        return "569.90";
      } else {
        return "1529.90";
      }
    },
    getRecommendedLikes() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      const postsCount = this.profileData ? this.profileData.postsCount : 0;
      
      if (postsCount < 10) {
        return "150 (15 por post)";
      } else if (currentFollowers < 1000) {
        return "500 (50 por post)";
      } else if (currentFollowers < 5000) {
        return "1000 (100 por post)";
      } else {
        return "2000 (200 por post)";
      }
    },
    getLikesPrice() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      
      if (currentFollowers < 1000) {
        return "49.90";
      } else if (currentFollowers < 5000) {
        return "89.90";
      } else if (currentFollowers < 10000) {
        return "159.90";
      } else {
        return "299.90";
      }
    },
    getRecommendedComments() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      const postsCount = this.profileData ? this.profileData.postsCount : 0;
      
      if (postsCount < 10) {
        return "30 (3 por post)";
      } else if (currentFollowers < 1000) {
        return "50 (5 por post)";
      } else if (currentFollowers < 5000) {
        return "100 (10 por post)";
      } else {
        return "200 (20 por post)";
      }
    },
    getCommentsPrice() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      
      if (currentFollowers < 1000) {
        return "69.90";
      } else if (currentFollowers < 5000) {
        return "119.90";
      } else if (currentFollowers < 10000) {
        return "219.90";
      } else {
        return "399.90";
      }
    },
    getRecommendedViews() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      
      if (currentFollowers < 1000) {
        return "5.000";
      } else if (currentFollowers < 5000) {
        return "10.000";
      } else if (currentFollowers < 10000) {
        return "20.000";
      } else {
        return "50.000";
      }
    },
    getViewsPrice() {
      const currentFollowers = this.profileData ? this.profileData.followersCount : 0;
      
      if (currentFollowers < 1000) {
        return "49.90";
      } else if (currentFollowers < 5000) {
        return "89.90";
      } else if (currentFollowers < 10000) {
        return "169.90";
      } else {
        return "399.90";
      }
    },
    getEngagementRating() {
      const engagement = parseFloat(this.calculateEngagement);
      
      if (engagement >= 4.5) return "Excelente";
      if (engagement >= 3.0) return "Muito Bom";
      if (engagement >= 1.5) return "Bom";
      if (engagement >= 0.8) return "Regular";
      return "Baixo";
    },
    getEngagementColorClass() {
      const engagement = parseFloat(this.calculateEngagement);
      
      if (engagement >= 4.5) return "excellent-engagement";
      if (engagement >= 3.0) return "very-good-engagement";
      if (engagement >= 1.5) return "good-engagement";
      if (engagement >= 0.8) return "regular-engagement";
      return "low-engagement";
    },
    getEngagementDescription() {
      const engagement = parseFloat(this.calculateEngagement);
      
      if (engagement >= 4.5) {
        return "Sua taxa de engajamento é excepcional! Continue com sua estratégia atual e considere parcerias com marcas.";
      }
      if (engagement >= 3.0) {
        return "Você tem um engajamento muito bom, acima da média do mercado. Mantenha a interação constante com seus seguidores.";
      }
      if (engagement >= 1.5) {
        return "Seu engajamento está na média para o seu nicho. Tente aumentar a interação com postagens mais envolventes.";
      }
      if (engagement >= 0.8) {
        return "Seu engajamento está abaixo da média. Considere criar conteúdo mais relevante e interativo.";
      }
      return "Sua taxa de engajamento precisa melhorar. Foque em criar conteúdo mais atrativo e envolvente.";
    },
    getNichePositionRating() {
      if (!this.profileData || !this.profileData.detailedAnalysis) return "Indeterminado";
      
      // Simular pontuação de posicionamento de nicho
      const nicheScore = this.profileData.detailedAnalysis.nichePositionScore || 
                          (this.profileData.followersCount > 10000 ? 90 : 
                          (this.profileData.followersCount > 5000 ? 75 : 
                          (this.profileData.followersCount > 1000 ? 60 : 45)));
      
      if (nicheScore >= 85) return "Excelente";
      if (nicheScore >= 70) return "Muito Bom";
      if (nicheScore >= 55) return "Bom";
      if (nicheScore >= 40) return "Regular";
      return "Necessita Melhorias";
    },
    getNichePosition() {
      if (!this.profileData) return "Indeterminado";
      
      // Valor de exemplo - em um sistema real, seria baseado na análise da conta
      const nicheName = this.profileData.detailedAnalysis?.nicheCategory || "Lifestyle";
      return `${this.getNichePositionRating()} em ${nicheName}`;
    },
    getNichePositionDescription() {
      const rating = this.getNichePositionRating();
      
      if (rating === "Excelente") {
        return "Você é uma referência no seu nicho. Sua posição de autoridade o torna ideal para parcerias com marcas.";
      }
      if (rating === "Muito Bom") {
        return "Você está bem posicionado no seu nicho. Continue criando conteúdo especializado para fortalecer sua autoridade.";
      }
      if (rating === "Bom") {
        return "Seu posicionamento está adequado, mas pode melhorar com conteúdo mais especializado e consistente.";
      }
      if (rating === "Regular") {
        return "Seu perfil precisa de um posicionamento mais claro. Defina melhor seu nicho e crie conteúdo mais direcionado.";
      }
      return "Recomendamos definir um nicho específico para seu perfil e focar em conteúdo especializado.";
    },
    getEstimatedReach() {
      if (!this.profileData || !this.profileData.followersCount) return "0 contas";
      
      // Cálculo simplificado: 15-25% dos seguidores
      const minReach = Math.round(this.profileData.followersCount * 0.15);
      const maxReach = Math.round(this.profileData.followersCount * 0.25);
      
      return `${this.formatNumber(minReach)} a ${this.formatNumber(maxReach)} contas por semana`;
    },
    getContentQualityRating() {
      // Em um sistema real, seria baseado na análise da qualidade das postagens
      if (!this.profileData) return "Indeterminado";
      
      const engagementScore = parseFloat(this.calculateEngagement);
      const followersRatio = this.profileData.followersCount / 
                            (this.profileData.followingCount || 1);
      
      // Pontuação baseada em uma combinação de fatores
      const score = this.getContentQualityScore();
      
      if (score >= 85) return "Excelente";
      if (score >= 70) return "Muito Bom";
      if (score >= 55) return "Bom";
      if (score >= 40) return "Regular";
      return "Necessita Melhorias";
    },
    getContentQualityScore() {
      if (!this.profileData) return 0;
      
      // Em um sistema real, seria baseado na análise da qualidade das postagens
      const baseScore = 60; // Pontuação base
      
      // Fatores que influenciam a pontuação
      const engagementBonus = Math.min(parseFloat(this.calculateEngagement) * 8, 20);
      const followRatioBonus = Math.min((this.calculateFollowRatio() - 1) * 5, 15);
      const postsBonus = Math.min(this.profileData.postsCount / 10, 15);
      
      return Math.round(Math.min(baseScore + engagementBonus + followRatioBonus + postsBonus, 100));
    },
    getContentQualityDescription() {
      const rating = this.getContentQualityRating();
      
      if (rating === "Excelente") {
        return "Seu conteúdo é de alta qualidade e relevância. Continua mantendo este padrão e considere diversificar formatos.";
      }
      if (rating === "Muito Bom") {
        return "Você produz conteúdo de qualidade que ressoa com seu público. Mantenha a consistência e explore novas tendências.";
      }
      if (rating === "Bom") {
        return "Seu conteúdo tem boa qualidade, mas há espaço para melhorias em termos de relevância e apresentação.";
      }
      if (rating === "Regular") {
        return "Seu conteúdo precisa de melhorias para engajar mais seguidores. Foque em qualidade visual e relevância.";
      }
      return "Recomendamos aprimorar a qualidade do seu conteúdo para aumentar o engajamento e atração de novos seguidores.";
    },
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
    downloadPDF() {
      // Implementar geração de PDF aqui
      alert('Função de download do relatório em PDF será implementada em breve!');
    },
    getRecommendations() {
      // Verifica se temos recomendações detalhadas
      if (this.profileData && this.profileData.detailedAnalysis && 
          this.profileData.detailedAnalysis.recommendations && 
          Array.isArray(this.profileData.detailedAnalysis.recommendations)) {
        return this.profileData.detailedAnalysis.recommendations;
      }
      
      // Fallback para o formato antigo
      if (this.profileData && this.profileData.aiAnalysis) {
        if (typeof this.profileData.aiAnalysis === 'string') {
          // Se for uma string (texto puro), criar recomendações básicas
          return [
            {
              title: "Otimize seu Perfil",
              description: "Melhore sua bio e visual do perfil para atrair mais seguidores.",
              priority: "Alta"
            },
            {
              title: "Crie Conteúdo Regular",
              description: "Mantenha um calendário de postagens consistente.",
              priority: "Média"
            },
            {
              title: "Engaje com Seguidores",
              description: "Responda comentários e interaja com seu público.",
              priority: "Alta"
            }
          ];
        } else if (Array.isArray(this.profileData.aiAnalysis)) {
          return this.profileData.aiAnalysis;
        }
      }
      
      // Caso não tenha encontrado recomendações em nenhum formato
      return [
        {
          title: "Recomendações Indisponíveis",
          description: "Não foi possível gerar recomendações detalhadas para este perfil.",
          priority: "Média"
        }
      ];
    },
    handleImageError(e) {
      console.error("Erro ao carregar imagem de perfil");
      e.target.src = this.imageFallback;
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
        console.log('[LOG] Dados parseados com sucesso para o usuário:', data.username);
        
        // Log detalhado da estrutura de dados
        console.log('[LOG] Estrutura de dados carregada:', data);
        
        this.profileData = data;
        
        // Verificar presença de dados essenciais para os novos insights
        if (this.profileData && this.profileData.detailedAnalysis) {
          console.log('[LOG] Objeto detailedAnalysis encontrado.');
          if (this.profileData.detailedAnalysis.insights) {
            console.log('[LOG] Objeto detailedAnalysis.insights encontrado.');
          } else {
            console.warn('[AVISO] Objeto detailedAnalysis.insights NÃO encontrado. Alguns insights podem usar valores padrão.');
          }
          if (this.profileData.detailedAnalysis.bioAnalysis) {
            console.log('[LOG] Objeto detailedAnalysis.bioAnalysis encontrado.');
          } else {
            console.warn('[AVISO] Objeto detailedAnalysis.bioAnalysis NÃO encontrado. Análise da bio pode usar valores padrão.');
          }
          // Adicionar mais verificações conforme necessário
        } else {
          console.warn('[AVISO] Objeto detailedAnalysis NÃO encontrado nos dados carregados. Novos insights podem usar valores padrão.');
        }

        // Verificar se as recomendações (aiAnalysis) estão presentes (lógica antiga)
        if (this.profileData.aiAnalysis) {
          console.log('[LOG] Recomendações (aiAnalysis) encontradas:', 
            Array.isArray(this.profileData.aiAnalysis) ? 
            `${this.profileData.aiAnalysis.length} recomendações` : 
            'Formato não esperado para aiAnalysis');
        } else {
          // Não é necessariamente um aviso se detailedAnalysis.recommendations for usado
          // console.warn('[AVISO] Nenhuma recomendação (aiAnalysis) encontrada nos dados'); 
        }

      } catch (e) {
        console.error('[ERRO] Falha ao processar dados salvos:', e);
        this.profileData = null; // Limpar dados em caso de erro
      }
    } else {
      console.warn('[AVISO] Nenhum dado encontrado no localStorage para a chave last_analysis_result');
      this.profileData = null; // Garantir que profileData seja null se nada for carregado
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

.bio-analysis-section {
  margin: 3rem 0;
}

.bio-score {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.score-label {
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 1rem;
}

.score-circles {
  display: flex;
  gap: 0.25rem;
}

.circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
}

.filled {
  background: #E1306C;
}

.score-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.bio-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.bio-strengths, .bio-weaknesses {
  flex: 1;
}

.strengths-list, .weaknesses-list {
  list-style: none;
  padding-left: 0;
}

.strength-item, .weakness-item {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.check-icon, .x-icon {
  margin-right: 0.5rem;
}

.bio-tip {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.tip-icon {
  margin-right: 0.5rem;
}

.insights-section {
  margin: 3rem 0;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.insight-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.growth-potential {
  border-top: 4px solid #dc3545;
}

.follow-ratio {
  border-top: 4px solid #ffc107;
}

.engagement-rate {
  border-top: 4px solid #28a745;
}

.niche-position {
  border-top: 4px solid #17a2b8;
}

.estimated-reach {
  border-top: 4px solid #6610f2;
}

.content-quality {
  border-top: 4px solid #fd7e14;
}

.level-badge, .score-badge, .position-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background-color: #e1306c;
  color: white;
}

.position-badge {
  background-color: #4267b2;
  color: white;
}

.reach-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #28a745;
  margin: 0.5rem 0 1rem;
}

.position-text, .ratio-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0.5rem 0 1rem;
  color: #495057;
}

.excellent-engagement {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.very-good-engagement {
  background: linear-gradient(90deg, #20c997, #17a2b8);
}

.good-engagement {
  background: linear-gradient(90deg, #17a2b8, #007bff);
}

.regular-engagement {
  background: linear-gradient(90deg, #007bff, #6610f2);
}

.low-engagement {
  background: linear-gradient(90deg, #6610f2, #e83e8c);
}

.insight-card h3 {
  margin: 0 0 1rem 0;
  color: #262626;
  padding-right: 100px;
}

.insight-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.projections-section {
  margin: 3rem 0;
}

.projections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.projection-card {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: transform 0.3s ease;
}

.projection-card:hover {
  transform: translateY(-5px);
}

.projection-period {
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.75rem;
}

.projection-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #e1306c;
  margin: 0.5rem 0;
}

.projection-label {
  font-size: 1rem;
  color: #666;
}

.projections-note {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
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
  font-size: 0.75rem;
  font-weight: 600;
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
  cursor: pointer;
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
  transition: background 0.2s ease;
}

.btn-back:hover {
  background: #c62b5f;
}

.score-bar {
  width: 100%;
  height: 14px;
  background-color: #f8f9fa;
  border-radius: 7px;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
}

.score-progress {
  height: 100%;
  background: linear-gradient(90deg, #ffc107, #ff5722);
  border-radius: 7px;
}

.score-text {
  font-weight: bold;
  color: #212529;
  text-align: center;
  margin-bottom: 1rem;
}

.services-section {
  margin: 3rem 0;
}

.services-intro {
  margin-bottom: 2rem;
}

.services-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.services-description {
  color: #666;
  line-height: 1.6;
}

.service-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.service-description {
  color: #666;
  line-height: 1.6;
}

.service-price-section {
  text-align: right;
}

.service-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.5rem;
}

.service-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  background: #E1306C;
  color: white;
  border: none;
}

.service-button:hover {
  background: #c62b5f;
}

.service-footer {
  text-align: center;
  margin-top: 1.5rem;
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
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style> 