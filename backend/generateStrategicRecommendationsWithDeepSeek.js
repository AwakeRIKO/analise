// Função para gerar recomendações estratégicas usando a API do DeepSeek
const axios = require('axios');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Inicializa a configuração para a API do DeepSeek
 * @returns {Object|null} Configuração da API do DeepSeek ou null se falhar
 */
function initializeDeepSeekConfig() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('Chave de API do DeepSeek não encontrada no arquivo .env');
    return null;
  }

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      baseURL: 'https://api.deepseek.com/v1'
    };
    
    console.log('Configuração da API DeepSeek inicializada com sucesso');
    return config;
  } catch (error) {
    console.error('Erro ao inicializar configuração da API DeepSeek:', error);
    return null;
  }
}

/**
 * Gera recomendações estratégicas usando a API do DeepSeek
 * @param {Object} profileData - Dados do perfil
 * @returns {Array|null} - Recomendações estratégicas ou null se falhar
 */
async function generateStrategicRecommendationsWithDeepSeek(profileData) {
  const apiConfig = initializeDeepSeekConfig();
  
  if (!apiConfig) {
    console.warn('Configuração da API DeepSeek não inicializada. Impossível gerar recomendações estratégicas.');
    return null;
  }

  // Criar um prompt detalhado com as informações do perfil
  const prompt = `
# Análise Estratégica para Perfil no Instagram: @${profileData.username}

## Dados do Perfil
- Nome: ${profileData.fullName || profileData.username}
- Bio: ${profileData.bio || 'Não disponível'}
- Seguidores: ${Number(profileData.followersCount || 0).toLocaleString()}
- Seguindo: ${Number(profileData.followingCount || 0).toLocaleString()}
- Publicações: ${Number(profileData.postsCount || 0).toLocaleString()}
- Taxa de Engajamento: ${((profileData.engagementRate || 0) * 100).toFixed(1)}%

Ofereça 5 recomendações estratégicas avançadas que ajudem este perfil a:
1. Aumentar engajamento
2. Crescer número de seguidores
3. Monetizar o perfil (se aplicável)
4. Melhorar o posicionamento de marca
5. Otimizar a estratégia de conteúdo

Para cada recomendação, forneça:
- Um título claro
- Uma descrição detalhada (2-3 frases)
- Uma dica prática de implementação
- O impacto esperado

Responda no formato JSON, seguindo exatamente este modelo:
[
  {
    "título": "Título da recomendação",
    "descrição": "Descrição detalhada da recomendação.",
    "implementação": "Como implementar esta recomendação na prática.",
    "impacto": "Benefício esperado desta implementação."
  },
  ...
]
`;

  try {
    // Configurar a requisição para a API do DeepSeek
    const requestData = {
      model: "deepseek-chat", // ou outro modelo disponível no DeepSeek
      messages: [
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    };

    // Fazer a chamada à API
    const response = await axios.post('/chat/completions', requestData, apiConfig);
    
    // Extrair o conteúdo da resposta
    const content = response.data.choices[0].message.content;
    
    try {
      // Tentar analisar como JSON
      const recommendations = JSON.parse(content);
      return recommendations;
    } catch (jsonError) {
      console.error('Erro ao analisar JSON da resposta do DeepSeek:', jsonError);
      console.log('Conteúdo bruto recebido:', content);
      
      // Tentar extrair apenas a parte JSON
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Erro ao extrair JSON da correspondência do DeepSeek:', e);
        }
      }
      
      // Falha na extração, retornar null
      return null;
    }
  } catch (error) {
    console.error('Erro ao gerar recomendações estratégicas com DeepSeek:', error);
    return null;
  }
}

module.exports = generateStrategicRecommendationsWithDeepSeek; 