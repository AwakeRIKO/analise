// Script para configurar o novo banco de dados MySQL
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configurações do novo banco de dados
const dbConfig = {
  host: '18.231.177.3',
  port: 3306,
  user: 'ricardo',
  password: 'Wakes110490key@',
  waitForConnections: true,
  connectionLimit: 1
};

// Verificar configuração
console.log('Configuração do novo banco de dados:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password ? 'DEFINIDA' : 'NÃO DEFINIDA'
});

// Nome do banco de dados que será criado
const DATABASE_NAME = 'instagram_automation';

// Função para testar a conexão com o banco de dados
async function testConnection() {
  console.log('Testando conexão com o servidor MySQL...');
  
  try {
    // Criar pool de conexão (sem especificar banco de dados)
    const pool = mysql.createPool(dbConfig);
    console.log('Pool de conexão criado com sucesso.');
    
    // Tentar obter uma conexão do pool
    const connection = await pool.getConnection();
    console.log('Conexão obtida com sucesso!');
    
    // Executar uma consulta simples
    const [rows] = await connection.query('SELECT 1 as teste');
    console.log('Consulta executada com sucesso:', rows);

    // Liberar a conexão
    connection.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('ERRO AO CONECTAR AO SERVIDOR MySQL:', error);
    console.error('Detalhes:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    return false;
  }
}

// Função para criar o banco de dados
async function createDatabase() {
  console.log(`Criando banco de dados '${DATABASE_NAME}'...`);
  
  try {
    // Conectar ao MySQL sem especificar banco de dados
    const pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    
    // Verificar se o banco já existe
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE ?`, 
      [DATABASE_NAME]
    );
    
    if (databases.length > 0) {
      console.log(`Banco de dados '${DATABASE_NAME}' já existe.`);
    } else {
      // Criar o banco de dados
      await connection.query(`CREATE DATABASE ${DATABASE_NAME}`);
      console.log(`Banco de dados '${DATABASE_NAME}' criado com sucesso!`);
    }
    
    // Selecionar o banco de dados
    await connection.query(`USE ${DATABASE_NAME}`);
    console.log(`Banco de dados '${DATABASE_NAME}' selecionado.`);
    
    connection.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('ERRO AO CRIAR BANCO DE DADOS:', error);
    return false;
  }
}

// Função para criar as tabelas
async function createTables() {
  console.log('Criando tabelas no banco de dados...');
  
  try {
    // Conectar ao banco de dados especificado
    const dbConfigWithDatabase = {
      ...dbConfig,
      database: DATABASE_NAME
    };
    
    const pool = mysql.createPool(dbConfigWithDatabase);
    const connection = await pool.getConnection();
    
    // Criar tabela para histórico de buscas de perfis
    await connection.query(`
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
    console.log('Tabela profile_search_history criada ou já existente.');
    
    // Criar tabela para contas do Instagram
    await connection.query(`
      CREATE TABLE IF NOT EXISTS instagram_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        cookies TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela instagram_accounts criada ou já existente.');
    
    // Criar índices para melhorar o desempenho
    try {
      await connection.query('CREATE INDEX idx_username ON profile_search_history(username)');
      console.log('Índice idx_username criado.');
    } catch (e) {
      console.log('Índice idx_username já existe ou erro ao criar:', e.message);
    }
    
    try {
      await connection.query('CREATE INDEX idx_search_timestamp ON profile_search_history(search_timestamp)');
      console.log('Índice idx_search_timestamp criado.');
    } catch (e) {
      console.log('Índice idx_search_timestamp já existe ou erro ao criar:', e.message);
    }
    
    try {
      await connection.query('CREATE INDEX idx_ig_accounts_username ON instagram_accounts(username)');
      console.log('Índice idx_ig_accounts_username criado.');
    } catch (e) {
      console.log('Índice idx_ig_accounts_username já existe ou erro ao criar:', e.message);
    }
    
    try {
      await connection.query('CREATE INDEX idx_ig_accounts_active ON instagram_accounts(is_active)');
      console.log('Índice idx_ig_accounts_active criado.');
    } catch (e) {
      console.log('Índice idx_ig_accounts_active já existe ou erro ao criar:', e.message);
    }
    
    // Liberar conexão
    connection.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('ERRO AO CRIAR TABELAS:', error);
    return false;
  }
}

// Função principal para configurar o banco de dados
async function setupDatabase() {
  console.log('Iniciando configuração do banco de dados...');
  
  // Testar conexão
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.error('Falha ao conectar ao servidor MySQL. Configuração abortada.');
    return false;
  }
  
  // Criar banco de dados
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    console.error('Falha ao criar banco de dados. Configuração abortada.');
    return false;
  }
  
  // Criar tabelas
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.error('Falha ao criar tabelas. Configuração abortada.');
    return false;
  }
  
  console.log('Configuração do banco de dados concluída com sucesso!');
  return true;
}

// Executar a configuração do banco de dados
setupDatabase()
  .then(success => {
    if (success) {
      console.log('Banco de dados configurado e pronto para uso!');
    } else {
      console.log('Houve um problema na configuração do banco de dados.');
    }
  })
  .catch(err => {
    console.error('Erro não tratado:', err);
  }); 