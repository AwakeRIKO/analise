// Script para testar diferentes opções de configuração para conectar ao novo banco de dados
const mysql = require('mysql2/promise');

// Diferentes opções de senha para testar (para verificar possíveis erros de digitação)
const passwordOptions = [
  'Wakes11049key@',  // Senha informada pelo usuário
  'Wakes110490key@', // Variação com um dígito adicional
  'Wakes11049Key@',  // Variação com K maiúsculo
  'Wakes110490Key@', // Combinação das variações anteriores
];

// Função para testar uma configuração de banco de dados
async function testDatabaseConfig(config) {
  console.log(`\nTestando configuração: ${JSON.stringify({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password ? '*****' : 'NÃO DEFINIDA'
  })}`);
  
  try {
    // Criar pool de conexão
    const pool = mysql.createPool(config);
    console.log('- Pool de conexão criado');
    
    // Tentar obter uma conexão do pool
    const connection = await pool.getConnection();
    console.log('- Conexão obtida com sucesso!');
    
    // Executar uma consulta simples
    const [rows] = await connection.query('SELECT 1 as teste');
    console.log(`- Consulta executada com sucesso: ${JSON.stringify(rows)}`);
    
    // Liberar a conexão de volta para o pool
    connection.release();
    console.log('- Conexão liberada');
    
    // Encerrar o pool de conexões
    await pool.end();
    console.log('- Pool encerrado');
    
    return true;
  } catch (error) {
    console.error(`- ERRO: ${error.message}`);
    console.error(`- Código de erro: ${error.code}`);
    return false;
  }
}

// Função principal que testa várias configurações
async function testAllConfigurations() {
  console.log('Iniciando testes de configuração do banco de dados...');
  let foundWorkingConfig = false;
  
  // Testar cada opção de senha
  for (const password of passwordOptions) {
    const config = {
      host: '18.231.177.3',
      port: 3306,
      user: 'ricardo',
      password: password,
      connectTimeout: 10000, // 10 segundos
      waitForConnections: true,
      connectionLimit: 1
    };
    
    const success = await testDatabaseConfig(config);
    if (success) {
      console.log(`\n✅ SUCESSO! Configuração funcionando com senha: ${password}`);
      foundWorkingConfig = true;
      break;
    }
  }
  
  if (!foundWorkingConfig) {
    console.log('\n❌ Nenhuma das configurações testadas funcionou.');
    console.log('\nRecomendações:');
    console.log('1. Verifique se o endereço IP e porta estão corretos');
    console.log('2. Verifique se o usuário tem permissão para acessar o banco de dados remotamente');
    console.log('3. Verifique se o firewall do servidor permite conexões na porta 3306');
    console.log('4. Entre em contato com o administrador do banco de dados para confirmar as credenciais');
  }
}

// Executar os testes
testAllConfigurations().catch(err => {
  console.error('Erro não tratado:', err);
}); 