<template>
  <div class="home-container">
    <!-- Banner Principal -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Análise de Perfil do Instagram</h1>
          <p class="hero-description">
            Descubra oportunidades de crescimento e insights valiosos para melhorar 
            seu perfil no Instagram com nossa ferramenta profissional.
          </p>
          <router-link to="/analyze" class="hero-button">
            Analisar meu perfil
          </router-link>
        </div>
        <div class="hero-image">
          <img src="/images/instagram-analysis.png" alt="Análise de Instagram" />
        </div>
      </div>
    </section>

    <!-- Seção de Benefícios -->
    <section class="benefits-section">
      <div class="container">
        <h2 class="section-title">O que você vai descobrir</h2>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">📊</div>
            <h3>Métricas Detalhadas</h3>
            <p>Análise completa da sua taxa de engajamento, alcance e crescimento.</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">🔍</div>
            <h3>Análise da Bio</h3>
            <p>Avaliação da sua biografia com pontos fortes e sugestões de melhoria.</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">📈</div>
            <h3>Projeções de Crescimento</h3>
            <p>Estimativas de crescimento em 3, 6 e 12 meses com ações estratégicas.</p>
          </div>
          
          <div class="benefit-card">
            <div class="benefit-icon">💡</div>
            <h3>Recomendações Personalizadas</h3>
            <p>Sugestões práticas adaptadas ao seu perfil específico.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Chamada para Ação -->
    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">Pronto para impulsionar seu perfil?</h2>
        <p class="cta-description">
          Obtenha insights profissionais e descubra como melhorar sua presença no Instagram.
        </p>
        <router-link to="/analyze" class="cta-button">
          Fazer análise gratuita
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home-container {
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 5rem 0;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  color: #262626;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-button {
  display: inline-block;
  background: #E1306C;
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.3s ease;
  font-size: 1.1rem;
}

.hero-button:hover {
  background: #c62b5f;
}

.hero-image {
  margin-top: 3rem;
  text-align: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Benefits Section */
.benefits-section {
  padding: 5rem 0;
  background-color: white;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #262626;
  margin-bottom: 3rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.benefit-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.benefit-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.benefit-card h3 {
  font-size: 1.25rem;
  color: #262626;
  margin-bottom: 1rem;
}

.benefit-card p {
  color: #666;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #E1306C, #c62b5f);
  color: white;
  padding: 5rem 0;
  text-align: center;
}

.cta-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  background: white;
  color: #E1306C;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.3s ease, transform 0.3s ease;
  font-size: 1.1rem;
}

.cta-button:hover {
  background: #f8f9fa;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title, .cta-title {
    font-size: 1.75rem;
  }
  
  .cta-description {
    font-size: 1.1rem;
  }
}
</style> 