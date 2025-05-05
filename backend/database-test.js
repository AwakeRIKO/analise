// Script para testar a conexão com o banco de dados MySQL
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Tentar carregar variáveis de ambiente
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

// Credenciais do banco de dados com valores diretos, caso o .env não funcione
const dbConfig = {
  host: process.env.DB_HOST || '177.74.189.168',
  port: parseInt(process.env.DB_PORT) || 3309,
  user: process.env.DB_USER || 'ricardo',
  password: process.env.DB_PASSWORD || '1234', // Adicionado valor padrão
  database: process.env.DB_DATABASE || 'instagram_automation',
  waitForConnections: true,
  connectionLimit: 1
};

// Verificar configuração
console.log('Configuração do banco de dados:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  password: dbConfig.password ? 'DEFINIDA' : 'NÃO DEFINIDA'
});

// Função principal para testar conexão
async function testDatabaseConnection() {
  console.log('Testando conexão com o banco de dados...');
  
  try {
    // Criar pool de conexão
    const pool = mysql.createPool(dbConfig);
    console.log('Pool de conexão criado com sucesso.');
    
    // Tentar obter uma conexão do pool
    const connection = await pool.getConnection();
    console.log('Conexão obtida com sucesso!');
    
    // Executar uma consulta simples
    const [rows] = await connection.query('SELECT 1 as teste');
    console.log('Consulta executada com sucesso:', rows);
    
    // Verificar se a tabela profile_search_history existe
    try {
      const [tables] = await connection.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'profile_search_history'", 
        [dbConfig.database]
      );
      
      if (tables.length > 0) {
        console.log('Tabela profile_search_history encontrada!');
        
        // Contar registros na tabela
        const [count] = await connection.query('SELECT COUNT(*) as total FROM profile_search_history');
        console.log(`Total de registros na tabela: ${count[0].total}`);
        
        // Mostrar últimos 5 registros
        if (count[0].total > 0) {
          const [lastEntries] = await connection.query(
            'SELECT id, username, followers, following, posts, search_timestamp FROM profile_search_history ORDER BY id DESC LIMIT 5'
          );
          console.log('Últimos 5 registros:', lastEntries);
        }
      } else {
        console.log('Tabela profile_search_history NÃO encontrada. Será necessário criá-la.');
      }
    } catch (tableError) {
      console.error('Erro ao verificar tabela profile_search_history:', tableError);
    }
    
    // Liberar a conexão de volta para o pool
    connection.release();
    console.log('Conexão liberada com sucesso.');
    
    // Encerrar o pool de conexões
    await pool.end();
    console.log('Pool de conexões encerrado.');
    
    return true;
  } catch (error) {
    console.error('ERRO AO CONECTAR AO BANCO DE DADOS:', error);
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

// Executar o teste
testDatabaseConnection()
  .then(result => {
    if (result) {
      console.log('\n✅ TESTE DE CONEXÃO BEM-SUCEDIDO!');
    } else {
      console.log('\n❌ TESTE DE CONEXÃO FALHOU!');
      console.log('Verifique suas credenciais e se o banco de dados está acessível.');
    }
  })
  .catch(err => {
    console.error('Erro inesperado durante o teste:', err);
  }); 