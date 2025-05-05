// Patch para atualizar a parte de configuração do banco de dados no server.js

// Importação do arquivo de configuração
const config = require('./config');

// Substitua a seção de configuração do banco de dados no server.js pelo seguinte código:

// --- Configuração do Banco de Dados ---
// Usar configuração centralizada do arquivo config.js
const dbConfig = config.db;

console.log('Configuração de banco de dados:', { 
  host: dbConfig.host, 
  port: dbConfig.port, 
  user: dbConfig.user, 
  database: dbConfig.database,
  password: dbConfig.password ? '******' : 'NÃO DEFINIDA'
}); 