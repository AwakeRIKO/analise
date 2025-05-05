// Arquivo de configuração centralizado
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Tentar carregar variáveis de ambiente do arquivo .env
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
    }
  }
} catch (error) {
  console.error('Erro ao carregar arquivo .env:', error);
}

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || '18.231.177.3', // Novos valores padrão
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'ricardo',
  password: process.env.DB_PASSWORD || 'Wakes110490key@', // Senha corrigida
  database: process.env.DB_DATABASE || 'instagram_automation',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Configuração da API
const apiConfig = {
  port: process.env.PORT || 5000,
  openAiApiKey: process.env.OPENAI_API_KEY,
  instagramUsername: process.env.INSTAGRAM_USERNAME,
  instagramPassword: process.env.INSTAGRAM_PASSWORD
};

// Configuração de caminhos
const pathConfig = {
  uploadDir: path.join(__dirname, 'uploads'),
  cacheDir: path.join(__dirname, 'cached-profiles'),
  sharedPhotoDir: path.join(__dirname, '..', 'foto')
};

// Garantir que os diretórios necessários existam
Object.values(pathConfig).forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Diretório criado: ${dir}`);
    } catch (error) {
      console.error(`Erro ao criar diretório ${dir}:`, error);
    }
  }
});

// Catálogo de serviços
const servicesCatalog = {
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

// Exportar configurações
module.exports = {
  db: dbConfig,
  api: apiConfig,
  paths: pathConfig,
  services: servicesCatalog
}; 