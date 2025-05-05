// Script para listar tabelas e exibir dados da tabela profile_search_history
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Tentar carregar variáveis de ambiente
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
} catch (error) {
  console.error('Erro ao carregar .env:', error);
}

// Configuração de conexão com o banco
const dbConfig = {
  host: process.env.DB_HOST || '177.74.189.168',
  port: parseInt(process.env.DB_PORT) || 3309,
  user: process.env.DB_USER || 'ricardo',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'instagram_automation'
};

async function showDatabaseInfo() {
  let connection;
  
  try {
    console.log('\n=== INFORMAÇÕES DO BANCO DE DADOS ===');
    console.log(`Conectando em: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Banco de dados: ${dbConfig.database}`);
    console.log(`Usuário: ${dbConfig.user}`);
    
    // Criar conexão
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexão estabelecida com sucesso!\n');
    
    // Listar todas as tabelas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('=== TABELAS DISPONÍVEIS ===');
    
    if (tables.length === 0) {
      console.log('Nenhuma tabela encontrada neste banco de dados.');
    } else {
      tables.forEach((row, index) => {
        const tableName = Object.values(row)[0];
        console.log(`${index + 1}. ${tableName}`);
      });
    }
    
    // Verificar se a tabela profile_search_history existe
    const profileTableExists = tables.some(row => 
      Object.values(row)[0] === 'profile_search_history'
    );
    
    if (profileTableExists) {
      console.log('\n=== DADOS DA TABELA profile_search_history ===');
      
      // Obter contagem total de registros
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM profile_search_history');
      const totalRecords = countResult[0].total;
      console.log(`Total de registros: ${totalRecords}`);
      
      if (totalRecords > 0) {
        // Obter e mostrar os últimos 5 registros
        const [records] = await connection.execute(
          'SELECT * FROM profile_search_history ORDER BY search_timestamp DESC LIMIT 5'
        );
        
        console.log('\nÚltimos 5 registros:');
        records.forEach((record, index) => {
          const date = new Date(record.search_timestamp).toLocaleString('pt-BR');
          console.log(`\nRegistro #${index + 1}:`);
          console.log(`ID: ${record.id}`);
          console.log(`Username: ${record.username}`);
          console.log(`Nome completo: ${record.full_name || 'N/A'}`);
          console.log(`Seguidores: ${record.followers}`);
          console.log(`Seguindo: ${record.following}`);
          console.log(`Posts: ${record.posts}`);
          console.log(`Taxa de engajamento: ${(record.engagement_rate * 100).toFixed(2)}%`);
          console.log(`Data da consulta: ${date}`);
        });
      }
    } else {
      console.log('\nA tabela profile_search_history NÃO FOI ENCONTRADA no banco de dados.');
      console.log('É possível que a tabela tenha um nome diferente ou ainda não tenha sido criada.');
      
      // Sugerir como criar a tabela
      console.log('\nPara criar a tabela, execute o seguinte SQL:');
      console.log(`
CREATE TABLE profile_search_history (
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
);`);
    }
    
  } catch (error) {
    console.error('\nERRO AO ACESSAR O BANCO DE DADOS:');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConexão com o banco de dados encerrada.');
    }
  }
}

// Executar função principal
showDatabaseInfo().catch(console.error); 