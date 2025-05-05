// Teste de conexão com a API do Google Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

async function testGeminiConnection() {
  console.log('Iniciando teste da API do Google Gemini...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('Erro: Chave API do Gemini não encontrada no arquivo .env');
    console.log('Verifique se você definiu a variável GEMINI_API_KEY no arquivo .env');
    return;
  }
  
  try {
    // Inicializar a API do Google Gemini
    const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('API do Google Gemini inicializada com sucesso');
    
    // Configurar modelo do Gemini
    const model = geminiAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Testar com uma consulta simples
    console.log('Enviando consulta de teste para o Gemini...');
    const prompt = "Gere 3 dicas para criar um perfil de Instagram de sucesso.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nResposta do Gemini:\n');
    console.log(text);
    console.log('\n===================================');
    console.log('✅ Conexão com a API do Google Gemini testada com sucesso!');
    
  } catch (error) {
    console.error('Erro ao testar conexão com o Gemini:', error);
    console.log('\n❌ O teste falhou. Verifique a chave API e sua conexão com a internet.');
    
    if (error.message.includes('API key')) {
      console.log('\nDica: A chave API do Gemini pode estar inválida ou incorreta.');
    } else if (error.message.includes('network')) {
      console.log('\nDica: Verifique sua conexão com a internet.');
    }
  }
}

// Executar o teste
testGeminiConnection(); 