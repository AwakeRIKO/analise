// Script para testar a conexão com o novo banco de dados MySQL
const mysql = require('mysql2/promise');

// Configurações do novo banco de dados
const dbConfig = {
  host: '18.231.177.3',
  port: 3306,
  user: 'ricardo',
  password: 'Wakes11049key@',
  waitForConnections: true,
  connectionLimit: 1
};

// Verificar configuração
console.log('Configuração do banco de dados:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
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

    // Verificar se o banco de dados existe
    const [databases] = await connection.query(
      'SHOW DATABASES LIKE ?', 
      ['instagram_automation']
    );
    
    if (databases.length > 0) {
      console.log('Banco de dados instagram_automation já existe!');
    } else {
      console.log('Banco de dados instagram_automation NÃO encontrado. Será necessário criá-lo.');
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

// Executar teste de conexão
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Teste de conexão concluído com sucesso!');
    } else {
      console.log('Teste de conexão falhou.');
    }
  })
  .catch(err => {
    console.error('Erro não tratado:', err);
  }); 