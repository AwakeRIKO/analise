const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');
const OpenAI = require('openai');
// const { GoogleGenerativeAI } = require('@google/generative-ai'); // Removido Gemini
const dotenv = require('dotenv');
const { PythonShell } = require('python-shell');
const fs = require('fs');
const mysql = require('mysql2/promise');
const axios = require('axios');
// const generateStrategicRecommendationsWithGemini = require('./generateStrategicRecommendationsWithGemini'); // Removido Gemini
// const generateStrategicRecommendationsWithDeepSeek = require('./generateStrategicRecommendationsWithDeepSeek'); // Removido DeepSeek
const generateStrategicRecommendationsWithOpenAI = require('./generateStrategicRecommendationsWithOpenAI'); // Adicionado OpenAI
const generateBioAnalysisWithOpenAI = require('./generateBioAnalysisWithOpenAI'); // Adicionado análise de biografia
const https = require('https');
const crypto = require('crypto');

// Carregar variáveis de ambiente
try {
  // Tentar carregar do arquivo .env na pasta backend
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log(`Arquivo .env encontrado em: ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    // Tentar carregar do arquivo .env na raiz do projeto
    const rootEnvPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(rootEnvPath)) {
      console.log(`Arquivo .env encontrado na raiz: ${rootEnvPath}`);
      dotenv.config({ path: rootEnvPath });
    } else {
      console.warn('Arquivo .env não encontrado. Usando valores padrão de configuração.');
      dotenv.config(); // Tentar carregar normalmente, mesmo assim
    }
  }
} catch (error) {
  console.error('Erro ao carregar arquivo .env:', error);
}

// Importar a função fetchProfileData do instagram.js
const { fetchProfileData } = require('./src/services/instagram');

// --- Configurações da Evolution API para WhatsApp ---
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || "Lucas"; // Valor padrão caso .env falhe
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY; // Lê a chave do .env
const WHATSAPP_URL = `https://api.vendadb.com/message/sendText/${WHATSAPP_INSTANCE}`;
const WHATSAPP_RECIPIENT_NUMBER = process.env.WHATSAPP_RECIPIENT_NUMBER; // Lê o número do .env
// -------------------------------------------------

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuração para servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos do frontend
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Rota catch-all para SPA
  app.get('*', (req, res) => {
    // Não redirecionar rotas da API
    if (req.url.startsWith('/api/')) {
      return;
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Dados fictícios para o perfil @ricardo_lpena para teste
const MOCK_PROFILE = {
  username: 'ricardo_lpena',
  fullName: 'Ricardo Lpena',
  bio: 'Developer & Digital Creator | Compartilhando conhecimento sobre tecnologia e desenvolvimento',
  profilePicture: 'https://placehold.co/150',
  followersCount: 2345,
  followingCount: 876,
  postsCount: 128,
  engagementRate: 0.045, // 4.5%
  media: [
    {
      url: 'https://placehold.co/500/8a3ab9/FFFFFF?text=Post+1',
      type: 'image',
      likes: 187,
      comments: 23
    },
    {
      url: 'https://placehold.co/500/e95950/FFFFFF?text=Post+2',
      type: 'image',
      likes: 203,
      comments: 17
    },
    {
      url: 'https://placehold.co/500/fccc63/000000?text=Post+3',
      type: 'video',
      likes: 412,
      comments: 45
    },
    {
      url: 'https://placehold.co/500/4c68d7/FFFFFF?text=Post+4',
      type: 'image',
      likes: 156,
      comments: 12
    },
    {
      url: 'https://placehold.co/500/3f729b/FFFFFF?text=Post+5',
      type: 'image',
      likes: 231,
      comments: 32
    },
    {
      url: 'https://placehold.co/500/cd486b/FFFFFF?text=Post+6',
      type: 'video',
      likes: 319,
      comments: 27
    }
  ]
};

// Catálogo de serviços
const SERVICES = {
  followers: [
    { qty: 1500, price: 99.99 },
    { qty: 3000, price: 189.90 },
    { qty: 5000, price: 289.90 },
    { qty: 10000, price: 569.90 },
    { qty: 30000, price: 1529.90 },
    { qty: 50000, price: 2499.90 },
    { qty: 100000, price: 4499.90 }
  ],
  likes: [
    { qty: 500, price: 45.00 },
    { qty: 1000, price: 60.00 }
  ],
  comments: [
    { qty: 10, price: 25.00 },
    { qty: 50, price: 90.00 }
  ],
  videoViews: [
    { qty: 1000, price: 55.00 },
    { qty: 5000, price: 240.00 }
  ],
  storyViews: [
    { qty: 1000, price: 75.00 }
  ],
  liveViews: [
    { qty: 500, duration: "1h", price: 299.90 }
  ],
  paidTraffic: { service: "Gestão de Tráfego Pago", price: 800.00 },
  socialMedia: { service: "Planos de Social Media", startingPrice: 499.99 }
};

// --- Configuração do Banco de Dados ---
// !! Recomendação: Mover para variáveis de ambiente (.env) !!
const dbConfig = {
  host: process.env.DB_HOST || '177.74.189.168', // Lê do .env ou usa valor padrão
  port: parseInt(process.env.DB_PORT) || 3309, // Converte a porta para número
  user: process.env.DB_USER || 'ricardo',
  password: process.env.DB_PASSWORD, // Lê a senha do .env (sem valor padrão por segurança)
  database: process.env.DB_DATABASE || 'instagram_automation',
  waitForConnections: true,
  connectionLimit: 10, // Limite de conexões no pool
  queueLimit: 0
};

console.log('Configuração de banco de dados:', { 
  host: dbConfig.host, 
  port: dbConfig.port, 
  user: dbConfig.user, 
  database: dbConfig.database,
  password: dbConfig.password ? '******' : 'NÃO DEFINIDA'
});

// Inicializar OpenAI API apenas se a chave estiver disponível no .env
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('API OpenAI inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar API OpenAI:', error);
  }
} else {
  console.warn("Chave API OpenAI não encontrada no .env. A análise por IA será desativada.");
}

let dbPool;

async function initializeDbPool() {
  try {
    dbPool = mysql.createPool(dbConfig);
    // Tenta pegar uma conexão para testar
    const connection = await dbPool.getConnection();
    console.log('Conexão com o banco de dados MySQL estabelecida com sucesso.');
    connection.release(); // Libera a conexão de volta para o pool
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados MySQL:', error);
    // Considerar parar a aplicação se o DB for essencial
    // process.exit(1); 
    dbPool = null; // Define como null para checagens posteriores
  }
}

// Função para inicializar tabelas do banco de dados
async function initializeDatabase() {
  if (!dbPool) {
    console.warn('Não foi possível inicializar tabelas - pool de conexão não disponível');
    return;
  }

  try {
    // Criar tabela para histórico de consultas
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS profile_search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        followers INT,
        following INT,
        posts INT,
        engagement_rate FLOAT,
        search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        bio TEXT,
        profile_picture_url TEXT,
        raw_data LONGTEXT
      )
    `);
    console.log('Tabela profile_search_history inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar tabelas:', error);
  }
}

// Função para salvar resultado da consulta no banco
async function saveSearchHistory(profileData) {
   if (!dbPool) {
    console.warn('Não foi possível salvar histórico - pool de conexão não disponível');
    return;
  }

  try {
    // Extrair dados relevantes
    const username = profileData.username;
    const fullName = profileData.fullName || '';
    const followers = profileData.stats?.followers || profileData.followersCount || 0;
    const following = profileData.stats?.following || profileData.followingCount || 0;
    const posts = profileData.stats?.posts || profileData.postsCount || 0;
    const engagementRate = profileData.engagementRate || 0;
    const bio = profileData.bio || '';
    const profilePicture = profileData.profilePicture || '';
    
    console.log(`Tentando salvar no banco de dados: username=${username}, followers=${followers}, following=${following}, posts=${posts}`);
    
    // Salvar dados no banco
    const result = await dbPool.query(
      `INSERT INTO profile_search_history 
       (username, full_name, followers, following, posts, engagement_rate, bio, profile_picture_url, raw_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        fullName,
        followers,
        following,
        posts,
        engagementRate,
        bio,
        profilePicture,
        JSON.stringify(profileData)
      ]
    );
    
    console.log(`Histórico de consulta salvo para ${username} com ID ${result[0].insertId}`);
    return result[0].insertId;
  } catch (error) {
    console.error('Erro ao salvar histórico de busca:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    return null;
  }
}

// Rotas
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor funcionando normalmente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    openaiAvailable: !!openai,
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor funcionando normalmente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    openaiAvailable: !!openai,
  });
});

// Rota para baixar e salvar imagens de perfil do Instagram
app.get('/api/profile-image/:username', async (req, res) => {
  const { username } = req.params;
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).send('URL da imagem é obrigatória');
  }
  
  try {
    // Criar um nome de arquivo único baseado no nome de usuário (para cache)
    const filename = `${username.toLowerCase()}.jpg`;
    // Usar a pasta compartilhada entre os PCs
    const sharedPath = path.join(__dirname, '..', 'foto', filename);
    
    // Verificar se a imagem já existe na pasta compartilhada
    if (fs.existsSync(sharedPath)) {
      console.log(`Imagem de perfil para ${username} encontrada na pasta compartilhada.`);
      
      // Servir o arquivo diretamente
      return res.sendFile(sharedPath);
    }
    
    console.log(`Baixando imagem de perfil para: ${username} da URL: ${imageUrl}`);
    
    // Baixar a imagem usando Axios e salvar localmente
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.instagram.com/'
      }
    });
    
    // Salvar a imagem na pasta compartilhada
    fs.writeFileSync(sharedPath, response.data);
    console.log(`Imagem de perfil salva para: ${username} em ${sharedPath}`);
    
    // Servir o arquivo recém-baixado
    res.sendFile(sharedPath);
  } catch (error) {
    console.error('Erro ao baixar imagem de perfil:', error.message);
    // Se falhar, redirecionar para uma imagem de placeholder
    res.redirect('/images/profile-placeholder.svg');
  }
});

// Rota para buscar perfil sem prefixo /api
app.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`Recebida requisição para perfil: ${username}`);

  try {
    // Implementação da rota...
    let profileData = await fetchProfileData(username);
    
    if (!profileData) {
      console.log(`Usando dados MOCK para: ${username}`);
      profileData = {
        ...MOCK_PROFILE,
        username: username
      };
    }
    
    // Gerar sugestões de serviços baseadas no perfil
    profileData.servicesSuggestions = generateServiceSuggestions(profileData);
    
    res.json(profileData);
  } catch (error) {
    console.error('Erro ao processar dados do perfil:', error);
    res.status(500).json({ error: 'Erro ao processar dados do perfil' });
  }
});

// Rota original com prefixo /api
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`Recebida requisição para perfil: ${username}`);

  try {
    // Implementação da rota...
    let profileData = await fetchProfileData(username);
    
    // Adicionar log para verificar os dados brutos, incluindo foto
    console.log('Dados recebidos de fetchProfileData:', JSON.stringify(profileData, null, 2));

    if (!profileData) {
      console.log(`Usando dados MOCK para: ${username}`);
      profileData = {
        ...MOCK_PROFILE,
        username: username
      };
    }
    
    // Gerar sugestões de serviços baseadas no perfil
    profileData.servicesSuggestions = generateServiceSuggestions(profileData);
    
    // Definir se OpenAI será usado (apenas se disponível)
    let useOpenAI = !!openai; // Usará OpenAI se a chave estiver configurada

    let modelUsed = 'local'; // Padrão
    
    // Tentar gerar recomendações estratégicas e análise da biografia com OpenAI se disponível
    try {
      if (useOpenAI) {
        console.log('Gerando recomendações estratégicas com OpenAI...');
        const strategicRecommendations = await generateStrategicRecommendationsWithOpenAI(profileData, openai);

        if (strategicRecommendations) {
          profileData.strategicRecommendations = strategicRecommendations;
          console.log('Recomendações estratégicas geradas com sucesso pelo OpenAI');
          modelUsed = 'openai';
    } else {
          console.warn('Falha ao gerar recomendações com OpenAI (função retornou null).');
          profileData.errorRecommendations = 'Falha ao gerar recomendações com OpenAI.';
        }
        
        // Gerar análise da biografia
        console.log('Gerando análise da biografia com OpenAI...');
        const bioAnalysis = await generateBioAnalysisWithOpenAI(profileData, openai);
        
        if (bioAnalysis) {
          profileData.bioAnalysis = bioAnalysis;
          console.log('Análise da biografia gerada com sucesso pelo OpenAI');
    } else {
          console.warn('Falha ao gerar análise da biografia com OpenAI (função retornou null).');
          profileData.errorBioAnalysis = 'Falha ao gerar análise da biografia com OpenAI.';
        }
      }

      // Adicionar o modelo usado à resposta, mesmo que seja 'local'
      profileData.modelUsed = modelUsed;

    } catch (error) {
      console.error('Erro ao gerar recomendações estratégicas ou análise de biografia com OpenAI:', error);
      profileData.errorRecommendations = 'Erro ao gerar recomendações ou análise de biografia com OpenAI: ' + error.message;
    }

    // Salvar histórico de consulta no banco de dados
    await saveSearchHistory(profileData);

    // Log final antes de enviar a resposta
    console.log('Dados enviados para o frontend:', JSON.stringify(profileData, null, 2));

    res.json(profileData);
  } catch (error) {
    console.error('Erro ao processar dados do perfil:', error);
    res.status(500).json({ error: 'Erro ao processar dados do perfil' });
  }
});

// Função para gerar sugestões de serviços baseadas no perfil
function generateServiceSuggestions(profileData) {
  const followersCount = profileData.stats?.followers || profileData.followersCount || 0;
  const postsCount = profileData.stats?.posts || profileData.postsCount || 0;

  // Criar recomendações baseadas nos dados do perfil
  const suggestions = {
    recommendedServices: [
      {
        id: 'followers',
        title: 'FaStar',
        description: 'Aumente seu perfil com seguidores reais e ativos',
        icon: 'FaStar',
        options: []
      },
      {
        id: 'engagement',
        title: 'FaChartLine',
        description: 'Aumente curtidas e comentários nas suas publicações',
        icon: 'FaChartLine',
        options: []
      }
    ],
    priorities: []
  };

  // Lógica para recomendar quantidade de seguidores
  if (followersCount < 1000) {
    suggestions.recommendedServices[0].options.push(
      { id: 'followers-1500', quantity: '1.500', price: 99.99 },
      { id: 'followers-3000', quantity: '3.000', price: 189.90 }
    );
    suggestions.priorities.push({ serviceId: 'followers', level: 'high' });
  } else if (followersCount < 5000) {
    suggestions.recommendedServices[0].options.push(
      { id: 'followers-2000', quantity: '2.000 a 2.300', price: 129.90 },
      { id: 'followers-5000', quantity: '5.000', price: 289.90 }
    );
    suggestions.priorities.push({ serviceId: 'followers', level: 'medium' });
  } else {
    suggestions.recommendedServices[0].options.push(
      { id: 'followers-5000', quantity: '5.000', price: 289.90 },
      { id: 'followers-10000', quantity: '10.000', price: 569.90 }
    );
  }

  // Lógica para recomendar engajamento
  if (postsCount > 0) {
    suggestions.recommendedServices[1].options.push(
      { id: 'likes-500', type: 'Curtidas', quantity: '500', price: 45.00 },
      { id: 'comments-10', type: 'Comentários', quantity: '10', price: 25.00 }
    );
    
    if (followersCount > 2000) {
      suggestions.priorities.push({ serviceId: 'engagement', level: 'medium' });
    }
  }

  // Adicionar gestão de social media se tiver muitos seguidores
  if (followersCount > 10000) {
    suggestions.recommendedServices.push({
      id: 'social-media',
      title: 'FaShoppingCart',
      description: 'Planos completos de social media para sua marca',
      icon: 'FaShoppingCart',
      options: [
        { id: 'social-media-basic', type: 'Plano Básico', price: 499.90 },
        { id: 'social-media-premium', type: 'Plano Premium', price: 899.90 }
      ]
    });
    suggestions.priorities.push({ serviceId: 'social-media', level: 'high' });
  }

  return suggestions;
}

// Nova rota para consultar histórico de pesquisas
app.get('/api/search-history', async (req, res) => {
  if (!dbPool) {
    return res.status(500).json({ error: 'Banco de dados não disponível' });
  }

  try {
    // Opcionalmente filtrar por username
    const username = req.query.username;
    let query = 'SELECT * FROM profile_search_history ORDER BY search_timestamp DESC LIMIT 100';
    let params = [];

    if (username) {
      query = 'SELECT * FROM profile_search_history WHERE username = ? ORDER BY search_timestamp DESC LIMIT 100';
      params = [username];
    }

    const [rows] = await dbPool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de pesquisas' });
  }
});

// Outras rotas...

// Porta padrão do servidor
const PORT = process.env.PORT || 5000;

// Inicializar o pool de conexões, inicializar database e iniciar o servidor
initializeDbPool()
  .then(() => {
    return initializeDatabase();
  })
  .then(() => {
    // Iniciar o servidor após a inicialização do pool e do banco
    app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
  })
  .catch(err => {
    console.error('Erro ao inicializar o servidor:', err);
  }); 