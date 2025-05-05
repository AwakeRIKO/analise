// Script para adicionar uma conta Instagram no banco de dados
const mysql = require('mysql2/promise');
const config = require('./config');

// Cookie no formato de array JSON (formato do navegador)
const browserCookies = [
  {"domain":".instagram.com","expirationDate":1760847747.599934,"hostOnly":false,"httpOnly":true,"name":"datr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"2rcHaKZ-i0TdhXt5mC6uxzPg"},
  {"domain":".instagram.com","expirationDate":1760847805.347792,"hostOnly":false,"httpOnly":true,"name":"ig_did","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"F5E69227-45D3-4D36-A92C-825E7E556358"},
  {"domain":".instagram.com","expirationDate":1760847768.392931,"hostOnly":false,"httpOnly":false,"name":"ig_nrcb","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"1"},
  {"domain":".instagram.com","expirationDate":1761614973.248032,"hostOnly":false,"httpOnly":false,"name":"csrftoken","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"AIYlzjPCZzbF2Khg7qwst10qHUZmsd1K"},
  {"domain":".instagram.com","expirationDate":1753838973.248181,"hostOnly":false,"httpOnly":false,"name":"ds_user_id","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"218050888"},
  {"domain":".instagram.com","expirationDate":1746529355.078289,"hostOnly":false,"httpOnly":false,"name":"mid","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"aBCxogALAAEjwhPRYV6jBczDmuWu"},
  {"domain":".instagram.com","expirationDate":1746710863,"hostOnly":false,"httpOnly":false,"name":"wd","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":"0","value":"2560x917"},
  {"domain":".instagram.com","expirationDate":1761658066.323416,"hostOnly":false,"httpOnly":true,"name":"sessionid","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"218050888%3A8LXZgbg9KpxyPo%3A2%3AAYfbS-xk9Wk2VfauG5tDKIKW4fE4pGNZ8fyudJ9S4c8"}
];

// Nome de usuário do Instagram (extraído do cookie ds_user_id)
const userId = browserCookies.find(c => c.name === "ds_user_id")?.value || "unknown";
const instagramUsername = `instagram_user_${userId}`;

// Função para converter cookies do navegador para o formato do instagrapi
function convertCookiesForInstagrapi(browserCookies) {
  // O instagrapi pode trabalhar com três formatos de cookies:
  // 1. Lista de cookies (como o formato do navegador)
  // 2. Dicionário onde as chaves são os nomes dos cookies
  // 3. Formato serializado (base64 + pickle) - não vamos usar esse
  
  // Vamos usar o formato mais simples: dicionário com os nomes dos cookies
  const cookieObject = {};
  
  browserCookies.forEach(cookie => {
    cookieObject[cookie.name] = cookie.value;
  });
  
  // O instagrapi precisa principalmente do sessionid
  const sessionid = cookieObject.sessionid;
  if (!sessionid) {
    throw new Error("Cookie 'sessionid' não encontrado. Este cookie é essencial para autenticação.");
  }
  
  return JSON.stringify(cookieObject);
}

async function addInstagramAccount() {
  try {
    // Extrair sessionid para verificação
    const sessionidCookie = browserCookies.find(c => c.name === "sessionid");
    if (!sessionidCookie) {
      throw new Error("Cookie 'sessionid' não encontrado. Este cookie é essencial para autenticação.");
    }
    
    console.log(`SessionID encontrado: ${sessionidCookie.value.substring(0, 10)}...`);
    
    // Converter cookies para o formato do instagrapi
    const cookiesForInstagrapi = convertCookiesForInstagrapi(browserCookies);
    
    // Conectar ao banco de dados
    const connection = await mysql.createConnection({
      ...config.db
    });
    
    console.log('Conexão com o banco de dados estabelecida');
    
    // Verificar se já existem contas no banco
    const [allAccounts] = await connection.execute(
      'SELECT id, username, is_active FROM instagram_accounts'
    );
    
    console.log(`Total de contas no banco: ${allAccounts.length}`);
    
    // Verificar se a conta já existe
    const [existingAccounts] = await connection.execute(
      'SELECT id FROM instagram_accounts WHERE username = ?',
      [instagramUsername]
    );
    
    if (existingAccounts.length > 0) {
      // Atualizar conta existente
      await connection.execute(
        'UPDATE instagram_accounts SET cookies = ?, is_active = TRUE, updated_at = NOW() WHERE username = ?',
        [cookiesForInstagrapi, instagramUsername]
      );
      console.log(`Conta ${instagramUsername} atualizada com sucesso!`);
    } else {
      // Inserir nova conta
      await connection.execute(
        'INSERT INTO instagram_accounts (username, cookies, is_active) VALUES (?, ?, TRUE)',
        [instagramUsername, cookiesForInstagrapi]
      );
      console.log(`Conta ${instagramUsername} adicionada com sucesso!`);
    }
    
    // Confirmar a inserção/atualização
    const [accounts] = await connection.execute(
      'SELECT id, username, is_active FROM instagram_accounts'
    );
    
    console.log('Contas no banco de dados:');
    accounts.forEach(account => {
      console.log(`ID: ${account.id}, Username: ${account.username}, Ativo: ${account.is_active ? 'Sim' : 'Não'}`);
    });
    
    // Testar a consulta que o instagrapi faz
    const [activeAccounts] = await connection.execute(
      `SELECT id, username, cookies, is_active 
       FROM instagram_accounts 
       WHERE is_active = TRUE 
       ORDER BY RAND() 
       LIMIT 1`
    );
    
    if (activeAccounts.length > 0) {
      console.log('\nConta ativa que será usada pelo instagrapi:');
      console.log(`ID: ${activeAccounts[0].id}, Username: ${activeAccounts[0].username}`);
      console.log(`Cookies armazenados (primeiros 50 caracteres): ${activeAccounts[0].cookies.substring(0, 50)}...`);
    } else {
      console.log('Nenhuma conta ativa encontrada!');
    }
    
    // Fechar conexão
    await connection.end();
    console.log('Conexão fechada');
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.code) console.error('Código de erro:', error.code);
  }
}

// Executar a função
addInstagramAccount()
  .then(() => console.log('Processo finalizado'))
  .catch(err => console.error('Erro não tratado:', err)); 