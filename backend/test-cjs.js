// Teste no formato CommonJS
const fs = require('fs');
const path = require('path');

console.log('CommonJS funcionando!');
console.log('Diretório atual:', __dirname);

// Testar leitura de arquivo
try {
  const packageJson = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  const pkg = JSON.parse(packageJson);
  console.log('Nome do pacote:', pkg.name);
  console.log('Versão:', pkg.version);
  console.log('Tipo de módulo:', pkg.type);
} catch (error) {
  console.error('Erro ao ler package.json:', error);
} 