// Função para gerar recomendações estratégicas usando a API da OpenAI
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente (embora a chave já deva ser carregada no server.js)
dotenv.config();

/**
 * Gera recomendações estratégicas usando a API da OpenAI
 * @param {Object} profileData - Dados do perfil
 * @param {OpenAI} openaiClient - Instância inicializada do cliente OpenAI
 * @returns {Array|null} - Recomendações estratégicas ou null se falhar
 */
async function generateStrategicRecommendationsWithOpenAI(profileData, openaiClient) {
  if (!openaiClient) {
    console.warn('Cliente OpenAI não inicializado. Impossível gerar recomendações estratégicas.');
    return null;
  }

  if (!profileData) {
      console.warn('Dados do perfil não fornecidos para generateStrategicRecommendationsWithOpenAI');
      return null;
  }

  // Criar um prompt detalhado com as informações do perfil
  const prompt = `
# Análise Estratégica para Perfil no Instagram: @${profileData.username || 'N/A'}

## Dados do Perfil
- Nome: ${profileData.fullName || profileData.username || 'N/A'}
- Bio: ${profileData.bio || 'Não disponível'}
- Seguidores: ${profileData.followersCount !== undefined ? Number(profileData.followersCount).toLocaleString() : 'N/A'}
- Seguindo: ${profileData.followingCount !== undefined ? Number(profileData.followingCount).toLocaleString() : 'N/A'}
- Publicações: ${profileData.postsCount !== undefined ? Number(profileData.postsCount).toLocaleString() : 'N/A'}
- Taxa de Engajamento: ${profileData.engagementRate !== undefined ? ((profileData.engagementRate || 0) * 100).toFixed(1) + '%' : 'N/A'}

Ofereça 5 recomendações estratégicas avançadas e acionáveis que ajudem este perfil a:
1. Aumentar engajamento de forma significativa.
2. Crescer o número de seguidores qualificados.
3. Explorar opções de monetização relevantes para o nicho (se aplicável).
4. Fortalecer o posicionamento e a identidade da marca/perfil.
5. Otimizar a estratégia de criação e distribuição de conteúdo.

Para cada recomendação, forneça:
- Um título claro e chamativo (ex: "Potencialize Seus Stories com Enquetes Interativas")
- Uma descrição detalhada explicando o 'porquê' e o 'como' (2-4 frases).
- Uma dica prática de implementação direta (ex: "Use a figurinha de enquete nos Stories pelo menos 3x por semana com perguntas relevantes para seu público.").
- O impacto esperado de forma concisa (ex: "Aumento do engajamento nos Stories e maior conexão com a audiência.").

Se os dados do perfil forem muito limitados (ex: poucos seguidores, sem bio), ajuste as recomendações para focar em construir a base do perfil primeiro.

Responda SOMENTE no formato JSON, seguindo exatamente este modelo, sem nenhum texto adicional antes ou depois:
[
  {
    "título": "Título da Recomendação 1",
    "descrição": "Descrição detalhada da recomendação 1.",
    "implementação": "Como implementar esta recomendação na prática.",
    "impacto": "Benefício esperado desta implementação."
  },
  {
    "título": "Título da Recomendação 2",
    "descrição": "Descrição detalhada da recomendação 2.",
    "implementação": "Como implementar esta recomendação na prática.",
    "impacto": "Benefício esperado desta implementação."
  }
]

IMPORTANTE: Certifique-se de que a resposta esteja em formato de ARRAY JSON.
`; // Fechando o template literal corretamente

  try {
    console.log('Enviando prompt para OpenAI...');
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou "gpt-4" se preferir e tiver acesso
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000, // Ajuste conforme necessário
      response_format: { type: "json_object" }, // Solicitar resposta em JSON diretamente, se o modelo suportar
    });

    const content = completion.choices[0].message.content;
    console.log('Resposta bruta da OpenAI recebida.'); // Não logar o 'content' em produção por custo/segurança

    if (!content) {
        console.error('Resposta da OpenAI veio vazia.');
        return null;
    }

    try {
      // Tentar analisar como JSON
      // A resposta já deve vir como JSON string por causa do response_format
      const parsedResponse = JSON.parse(content);
      console.log('Tipo de resposta:', typeof parsedResponse);
      
      // NOVA LÓGICA: Verifica diferentes formatos possíveis e normaliza
      
      // Caso 1: Já é um array - formato correto
      if (Array.isArray(parsedResponse)) {
          console.log('Resposta é um array, formato correto.');
          return parsedResponse;
      }
      
      // Caso 2: É um objeto JSON com propriedade 'recommendations' que é um array
      if (parsedResponse && typeof parsedResponse === 'object' && 
          Array.isArray(parsedResponse.recommendations)) {
          console.log('Resposta tem array encapsulado em recommendations, extraindo.');
          return parsedResponse.recommendations;
      }
      
      // Caso 3: É um objeto único (não um array) com os campos esperados
      if (parsedResponse && typeof parsedResponse === 'object' && 
          parsedResponse.título && parsedResponse.descrição && 
          parsedResponse.implementação && parsedResponse.impacto) {
          console.log('Resposta é um objeto único, convertendo para array.');
          return [parsedResponse]; // Transforma em array com um item
      }
      
      // Caso 4: É um objeto com uma única propriedade que é um array
      if (parsedResponse && typeof parsedResponse === 'object' && 
          Object.keys(parsedResponse).length === 1 && 
          Array.isArray(Object.values(parsedResponse)[0])) {
          console.log("Resposta JSON veio encapsulada, extraindo array.");
          return Object.values(parsedResponse)[0];
      }
      
      // Caso 5: Tentar extrair manualmente se for um formato desconhecido
      console.error('Formato JSON inesperado da OpenAI:', content);
      
      // Verificar se o conteúdo tem algum objeto com os campos esperados
      if (typeof parsedResponse === 'object') {
          const possibleRecommendations = [];
          
          // Verificar o objeto principal
          if (parsedResponse.título && parsedResponse.descrição && 
              parsedResponse.implementação && parsedResponse.impacto) {
              possibleRecommendations.push(parsedResponse);
          }
          
          // Verificar se há objetos aninhados que parecem recomendações
          Object.values(parsedResponse).forEach(value => {
              if (typeof value === 'object' && value !== null &&
                  value.título && value.descrição && 
                  value.implementação && value.impacto) {
                  possibleRecommendations.push(value);
              }
          });
          
          if (possibleRecommendations.length > 0) {
              console.log(`Extraídas ${possibleRecommendations.length} recomendações de formato irregular.`);
              return possibleRecommendations;
          }
      }
      
      // Última tentativa: usar regex para extrair JSON array
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch && jsonMatch[0]) {
          try {
              console.log("Tentando extrair JSON com regex.");
              return JSON.parse(jsonMatch[0]);
          } catch (e) {
              console.error('Erro ao extrair JSON com regex:', e);
          }
      }
      
      // Se chegou aqui, não conseguiu processar a resposta
      console.error('Não foi possível extrair recomendações válidas da resposta.');
      return null;
    } catch (jsonError) {
      console.error('Erro ao analisar JSON da resposta da OpenAI:', jsonError);
      console.log('Conteúdo bruto recebido:', content); // Logar o conteúdo bruto em caso de erro de parsing
      return null;
    }
  } catch (error) {
    console.error('Erro ao gerar recomendações estratégicas com OpenAI:', error);
    return null;
  }
}

module.exports = generateStrategicRecommendationsWithOpenAI; 