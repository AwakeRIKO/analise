// Função para gerar análise da biografia usando a API da OpenAI
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Gera análise da biografia do perfil do Instagram usando a API da OpenAI
 * @param {Object} profileData - Dados do perfil
 * @param {OpenAI} openaiClient - Instância inicializada do cliente OpenAI
 * @returns {Object|null} - Análise da biografia ou null se falhar
 */
async function generateBioAnalysisWithOpenAI(profileData, openaiClient) {
  if (!openaiClient) {
    console.warn('Cliente OpenAI não inicializado. Impossível gerar análise da biografia.');
    return null;
  }

  if (!profileData) {
    console.warn('Dados do perfil não fornecidos para generateBioAnalysisWithOpenAI');
    return null;
  }

  if (!profileData.bio || profileData.bio.trim() === '' || profileData.bio.length < 5) {
    console.warn('Bio não disponível ou muito curta para análise');
    return {
      score: 20,
      summary: "A biografia do perfil está ausente ou é extremamente curta. Uma biografia bem elaborada é fundamental para atrair seguidores e explicar o propósito do perfil.",
      criteria: [
        {
          name: "Presença de biografia",
          status: "poor",
          description: "A biografia está ausente ou é muito curta, o que dificulta a compreensão do propósito do perfil."
        }
      ],
      improvements: [
        "Crie uma biografia que explique quem você é e o que você faz",
        "Adicione palavras-chave relevantes para seu nicho",
        "Inclua um call-to-action (CTA) para direcionar seus seguidores",
        "Adicione emojis para tornar a biografia mais atrativa visualmente"
      ]
    };
  }

  // Criar um prompt detalhado para análise da biografia
  const prompt = `
# Análise de Biografia para Perfil no Instagram: @${profileData.username || 'N/A'}

## Dados do Perfil
- Nome: ${profileData.fullName || profileData.username || 'N/A'}
- Bio: "${profileData.bio || 'Não disponível'}"
- Seguidores: ${profileData.followersCount !== undefined ? Number(profileData.followersCount).toLocaleString() : 'N/A'}

## Tarefa
Analise a biografia deste perfil do Instagram e forneça:
1. Uma pontuação de 0 a 100 para a qualidade geral da biografia
2. Um resumo conciso (1-2 frases) avaliando a biografia
3. Avaliação detalhada de 4 critérios específicos:
   - Clareza e propósito: A bio comunica com clareza quem é a pessoa/marca e o que oferece?
   - Palavras-chave e relevância: A bio inclui termos relevantes para o nicho?
   - Call-to-action (CTA): A bio motiva o visitante a realizar alguma ação?
   - Formatação e estilo: A bio usa elementos visuais (emojis, espaçamento) de forma eficaz?
4. Lista de 3-5 sugestões concretas para melhorar a biografia

Responda SOMENTE no formato JSON, seguindo exatamente este modelo, sem nenhum texto adicional antes ou depois:
{
  "score": 75,
  "summary": "Resumo curto e direto da análise geral da biografia.",
  "criteria": [
    {
      "name": "Clareza e propósito",
      "status": "good",
      "description": "Avaliação detalhada deste critério."
    },
    {
      "name": "Palavras-chave e relevância",
      "status": "excellent",
      "description": "Avaliação detalhada deste critério."
    },
    {
      "name": "Call-to-action",
      "status": "poor",
      "description": "Avaliação detalhada deste critério."
    },
    {
      "name": "Formatação e estilo",
      "status": "ok",
      "description": "Avaliação detalhada deste critério."
    }
  ],
  "improvements": [
    "Sugestão específica para melhorar a biografia 1",
    "Sugestão específica para melhorar a biografia 2",
    "Sugestão específica para melhorar a biografia 3"
  ]
}

IMPORTANTE: Use apenas os seguintes valores para o campo "status": "excellent", "good", "ok", "poor".
`; 

  try {
    console.log('Enviando prompt para análise de biografia via OpenAI...');
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    console.log('Resposta de análise de biografia recebida.');

    if (!content) {
        console.error('Resposta da OpenAI para análise de biografia veio vazia.');
        return null;
    }

    try {
      // Tentar analisar como JSON
      const parsedResponse = JSON.parse(content);
      console.log('Análise de biografia processada com sucesso.');
      
      // Validar os campos essenciais da resposta
      if (parsedResponse && 
          typeof parsedResponse === 'object' && 
          parsedResponse.score !== undefined &&
          parsedResponse.summary &&
          Array.isArray(parsedResponse.criteria) &&
          Array.isArray(parsedResponse.improvements)) {
        
        return parsedResponse;
      }
      
      console.error('Resposta da análise de biografia não contém todos os campos necessários.');
      return null;
    } catch (jsonError) {
      console.error('Erro ao analisar JSON da resposta da OpenAI (análise de biografia):', jsonError);
      console.log('Conteúdo bruto recebido:', content);
      return null;
    }
  } catch (error) {
    console.error('Erro ao gerar análise de biografia com OpenAI:', error);
    return null;
  }
}

module.exports = generateBioAnalysisWithOpenAI; 