<template>
  <div class="about-container">
    <div class="container">
      <div class="about-header">
        <h1 class="about-title">Sobre o Analisador de Perfil</h1>
        <p class="about-subtitle">
          Desenvolvido pela Divulga Mais Brasil para ajudar na análise e crescimento de perfis no Instagram
        </p>
      </div>
      
      <div class="about-content">
        <section class="about-section">
          <h2>O que é o Analisador de Perfil?</h2>
          <p>
            O Analisador de Perfil do Instagram é uma ferramenta profissional desenvolvida pela 
            Divulga Mais Brasil para analisar perfis no Instagram e fornecer insights valiosos 
            sobre o desempenho, engajamento e potencial de crescimento.
          </p>
          <p>
            Nossa ferramenta utiliza algoritmos avançados e análise de dados para identificar 
            pontos fortes e oportunidades de melhoria em perfis do Instagram, ajudando influenciadores 
            e empresas a otimizarem sua presença na plataforma.
          </p>
        </section>
        
        <section class="about-section">
          <h2>Como Funciona?</h2>
          <ol class="steps-list">
            <li>
              <strong>Digite seu nome de usuário:</strong> Insira o @ do seu perfil no Instagram para começar a análise.
            </li>
            <li>
              <strong>Processamento de dados:</strong> Nossa ferramenta coleta e analisa dados públicos disponíveis do seu perfil.
            </li>
            <li>
              <strong>Análise detalhada:</strong> Geramos relatórios com métricas de engajamento, análise da bio e recomendações personalizadas.
            </li>
            <li>
              <strong>Resultados e insights:</strong> Você recebe um relatório completo com insights valiosos e ações práticas para melhorar seu perfil.
            </li>
          </ol>
        </section>
        
        <section class="about-section">
          <h2>Sobre a Divulga Mais Brasil</h2>
          <p>
            A Divulga Mais Brasil é uma agência especializada em marketing digital e estratégias 
            de crescimento para redes sociais. Com anos de experiência no mercado, ajudamos 
            influenciadores, empresas e marcas a aumentarem sua presença online e alcançarem 
            seus objetivos de engajamento e conversão.
          </p>
          <p>
            Nossa equipe é formada por especialistas em marketing digital, análise de dados 
            e estratégias de crescimento para redes sociais, com foco especial no Instagram.
          </p>
          <div class="about-cta">
            <a href="https://divulgamaisbrasil.com" target="_blank" class="about-link">
              Conheça mais sobre nossos serviços
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
.about-container {
  padding: 4rem 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.about-title {
  font-size: 2.5rem;
  color: #262626;
  margin-bottom: 1rem;
}

.about-subtitle {
  font-size: 1.25rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

.about-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.about-section {
  margin-bottom: 3rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

.about-section h2 {
  font-size: 1.75rem;
  color: #262626;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #E1306C;
  display: inline-block;
}

.about-section p {
  color: #666;
  line-height: 1.7;
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
}

.steps-list {
  padding-left: 1.5rem;
}

.steps-list li {
  margin-bottom: 1.25rem;
  color: #666;
  line-height: 1.7;
  font-size: 1.1rem;
}

.about-cta {
  margin-top: 2rem;
  text-align: center;
}

.about-link {
  display: inline-block;
  background: #E1306C;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.3s ease;
}

.about-link:hover {
  background: #c62b5f;
}

@media (max-width: 768px) {
  .about-title {
    font-size: 2rem;
  }
  
  .about-subtitle {
    font-size: 1.1rem;
  }
  
  .about-container {
    padding: 2rem 0;
  }
  
  .about-content {
    padding: 1.5rem;
  }
  
  .about-section h2 {
    font-size: 1.5rem;
  }
  
  .about-section p, .steps-list li {
    font-size: 1rem;
  }
}
</style> 