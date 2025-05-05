// Teste simples de ES Modules
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('ES Modules funcionando!');
console.log('Diretório atual:', __dirname);

// Testar leitura de arquivo
async function testFileAccess() {
  try {
    const packageJson = await fs.readFile(path.join(__dirname, 'package.json'), 'utf8');
    const pkg = JSON.parse(packageJson);
    console.log('Nome do pacote:', pkg.name);
    console.log('Versão:', pkg.version);
    console.log('Tipo de módulo:', pkg.type);
  } catch (error) {
    console.error('Erro ao ler package.json:', error);
  }
}

testFileAccess(); 