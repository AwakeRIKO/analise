/**
 * Script para testar a integração do instagrapi com NodeJS
 * Este script executa o instagrapi_fetcher.py usando o módulo child_process
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuração de ambiente
const config = {
    // Configurações do banco de dados
    DB_HOST: process.env.DB_HOST || '177.74.189.168',
    DB_PORT: process.env.DB_PORT || '3309',
    DB_USER: process.env.DB_USER || 'ricardo',
    DB_PASSWORD: process.env.DB_PASSWORD || 'Wakes110490key@', // Senha atualizada
    DB_DATABASE: process.env.DB_DATABASE || 'instagram_automation',
    
    // Configurações do Instagram (para modo sem banco de dados)
    INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME || '',
    INSTAGRAM_PASSWORD: process.env.INSTAGRAM_PASSWORD || ''
};

// Username a ser testado
const usernameToTest = process.argv[2] || 'mayracristina77';

// Caminho para o script Python
const pythonScriptPath = path.resolve(__dirname, '../scripts/instagrapi_fetcher.py');

// Verificar se o script Python existe
if (!fs.existsSync(pythonScriptPath)) {
    console.error(`Erro: Script Python não encontrado em: ${pythonScriptPath}`);
    process.exit(1);
}

console.log(`Caminho do script Python: ${pythonScriptPath}`);
console.log(`Testando username: ${usernameToTest}`);

// Configurar variáveis de ambiente para o processo Python
const envVars = {
    ...process.env,
    DB_HOST: config.DB_HOST,
    DB_PORT: config.DB_PORT,
    DB_USER: config.DB_USER,
    DB_PASSWORD: config.DB_PASSWORD,
    DB_DATABASE: config.DB_DATABASE,
    INSTAGRAM_USERNAME: config.INSTAGRAM_USERNAME,
    INSTAGRAM_PASSWORD: config.INSTAGRAM_PASSWORD
};

// Executar o script Python
const pythonProcess = spawn('python', [pythonScriptPath, usernameToTest], {
    env: envVars
});

// Coletar a saída do processo
let outputData = '';
let errorData = '';

pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    outputData += output;
    console.log(`Python (stdout): ${output}`);
});

pythonProcess.stderr.on('data', (data) => {
    const error = data.toString();
    errorData += error;
    console.error(`Python (stderr): ${error}`);
});

pythonProcess.on('close', (code) => {
    console.log(`Processo Python encerrado com código: ${code}`);
    
    if (code !== 0) {
        console.error('Erro ao executar o script Python');
        console.error(`Erro: ${errorData}`);
        return;
    }
    
    // Extrair e analisar o resultado JSON
    try {
        // Procurar por uma string JSON válida na saída
        const jsonMatches = outputData.match(/({[\s\S]*})/);
        if (jsonMatches && jsonMatches[1]) {
            const jsonStr = jsonMatches[1];
            const result = JSON.parse(jsonStr);
            
            console.log('\n=== RESULTADO ANALISADO ===');
            if (result.error) {
                console.error(`Erro: ${result.error}`);
            } else {
                console.log(`Username: ${result.username}`);
                console.log(`Nome: ${result.fullName}`);
                console.log(`Bio: ${result.bio}`);
                console.log('Estatísticas:');
                console.log(`  Seguidores: ${result.stats.followers}`);
                console.log(`  Seguindo: ${result.stats.following}`);
                console.log(`  Posts: ${result.stats.posts}`);
            }
        } else {
            console.error('Não foi possível encontrar dados JSON válidos na saída do Python.');
            console.log('Saída bruta:');
            console.log(outputData);
        }
    } catch (e) {
        console.error('Erro ao analisar o resultado JSON:', e);
        console.log('Saída bruta:');
        console.log(outputData);
    }
}); 