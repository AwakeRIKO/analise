// Função para gerar recomendações estratégicas usando a API do Google Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Inicializa o cliente da API do Google Gemini
 * @returns {Object|null} Cliente da API do Gemini ou null se falhar
 */
function initializeGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Chave de API do Google Gemini não encontrada no arquivo .env');
    return null;
  }

  try {
    const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('API Google Gemini inicializada com sucesso');
    return geminiAI;
  } catch (error) {
    console.error('Erro ao inicializar API Google Gemini:', error);
    return null;
  }
}

/**
 * Gera recomendações estratégicas usando diferentes versões de modelos Gemini
 * @param {Object} profileData - Dados do perfil
 * @returns {Array|null} - Recomendações estratégicas ou null se falhar
 */
async function generateStrategicRecommendationsWithGemini(profileData) {
  const geminiAI = initializeGeminiClient();
  
  if (!geminiAI) {
    console.warn('API Google Gemini não inicializada. Impossível gerar recomendações estratégicas.');
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
    // Tentar com diferentes versões de modelos do Gemini
    const modelOptions = ["gemini-1.0-pro", "gemini-pro"];
    let result = null;
    let error = null;
    
    for (const modelName of modelOptions) {
      try {
        console.log(`Tentando gerar conteúdo com o modelo ${modelName}...`);
        const model = geminiAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        console.log(`Conteúdo gerado com sucesso usando o modelo ${modelName}`);
        break; // Se conseguiu gerar, sai do loop
      } catch (err) {
        console.error(`Erro ao usar o modelo ${modelName}:`, err.message);
        error = err;
      }
    }
    
    if (!result && error) {
      throw error; // Repassar o último erro se nenhum modelo funcionou
    }
    
    // Processar o resultado
    const response = await result.response;
    const content = response.text();
    
    try {
      // Tentar analisar como JSON
      const recommendations = JSON.parse(content);
      return recommendations;
    } catch (jsonError) {
      console.error('Erro ao analisar JSON da resposta do Gemini:', jsonError);
      console.log('Conteúdo bruto recebido:', content);
      
      // Tentar extrair apenas a parte JSON
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Erro ao extrair JSON da correspondência do Gemini:', e);
        }
      }
      
      // Falha na extração, retornar null
      return null;
    }
  } catch (error) {
    console.error('Erro ao gerar recomendações estratégicas com Gemini:', error);
    return null;
  }
}

module.exports = generateStrategicRecommendationsWithGemini; 