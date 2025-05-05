import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Utilitário para corrigir formato de cookies JSON
 */
class CookieFixer {
  /**
   * Verifica e corrige um arquivo de cookies (versão síncrona)
   * @param {string} filePath - Caminho para o arquivo de cookies
   * @returns {boolean} - Verdadeiro se corrigido com sucesso
   */
  static fixCookieFile(filePath) {
    try {
      console.log(`Verificando arquivo de cookies: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.error(`Arquivo não encontrado: ${filePath}`);
        return false;
      }
      
      // Ler o conteúdo do arquivo
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Processar cada linha separadamente
      const lines = content.split('\n').filter(line => line.trim());
      const validAccounts = [];
      const invalidAccounts = [];
      
      for (let i = 0; i < lines.length; i++) {
        try {
          // Uma linha válida deve conter username|jsonCookies
          const parts = lines[i].split('|');
          
          if (parts.length < 2) {
            console.warn(`Linha ${i+1}: Formato inválido (falta separador |)`);
            invalidAccounts.push({ line: i+1, content: lines[i], error: 'Formato inválido' });
            continue;
          }
          
          const username = parts[0].trim();
          let cookieStr = parts.slice(1).join('|').trim();
          
          // Verificar se o cookie é um JSON válido
          try {
            // Tentar analisar o JSON
            JSON.parse(cookieStr);
            // Se for válido, adiciona à lista
            validAccounts.push(`${username}|${cookieStr}`);
          } catch (jsonError) {
            console.warn(`Linha ${i+1}: JSON inválido para usuário ${username}`);
            
            // Tentar corrigir alguns problemas comuns de JSON
            try {
              // Verificar se há caracteres extras após o JSON
              if (cookieStr.endsWith(']')) {
                // Garantir que não há nada depois do ']'
                const lastBracketPos = cookieStr.lastIndexOf(']');
                if (lastBracketPos < cookieStr.length - 1) {
                  cookieStr = cookieStr.substring(0, lastBracketPos + 1);
                  console.log(`Linha ${i+1}: Removidos caracteres extras após JSON`);
                }
              }
              
              // Verificar problemas com quebras de linha dentro do JSON
              cookieStr = cookieStr.replace(/\r/g, '').replace(/\n/g, '');
              
              // Testar se agora é um JSON válido
              JSON.parse(cookieStr);
              
              // Se chegou aqui, conseguimos corrigir
              console.log(`Linha ${i+1}: JSON corrigido para usuário ${username}`);
              validAccounts.push(`${username}|${cookieStr}`);
            } catch (fixError) {
              invalidAccounts.push({ 
                line: i+1, 
                username, 
                error: fixError.message,
                content: cookieStr.length > 50 ? 
                  cookieStr.substring(0, 25) + '...' + cookieStr.substring(cookieStr.length - 25) : 
                  cookieStr
              });
            }
          }
        } catch (e) {
          console.error(`Erro ao processar linha ${i+1}:`, e.message);
          invalidAccounts.push({ line: i+1, content: lines[i], error: e.message });
        }
      }
      
      // Resumo das correções
      console.log(`\nResumo do arquivo de cookies:`);
      console.log(`Total de linhas: ${lines.length}`);
      console.log(`Contas válidas: ${validAccounts.length}`);
      console.log(`Contas inválidas: ${invalidAccounts.length}`);
      
      if (invalidAccounts.length > 0) {
        console.log('\nDetalhes das contas inválidas:');
        invalidAccounts.forEach(inv => {
          console.log(`- Linha ${inv.line}: ${inv.error}`);
        });
      }
      
      if (validAccounts.length === 0) {
        console.error('Nenhuma conta válida encontrada no arquivo!');
        return false;
      }
      
      // Criar arquivo corrigido
      const fixedPath = `${filePath}.fixed`;
      fs.writeFileSync(fixedPath, validAccounts.join('\n'), 'utf8');
      console.log(`\nArquivo corrigido salvo em: ${fixedPath}`);
      
      // Fazer backup do original
      const backupPath = `${filePath}.bak`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`Backup do original salvo em: ${backupPath}`);
      
      // Substituir o original pelo corrigido
      fs.copyFileSync(fixedPath, filePath);
      console.log(`Arquivo original substituído pela versão corrigida`);
      
      return true;
    } catch (error) {
      console.error('Erro ao corrigir arquivo de cookies:', error);
      return false;
    }
  }
  
  /**
   * Verifica e corrige um arquivo de cookies (versão assíncrona)
   * @param {string} filePath - Caminho para o arquivo de cookies
   * @returns {Promise<boolean>} - Verdadeiro se corrigido com sucesso
   */
  static async fixCookieFileAsync(filePath) {
    return this.fixCookieFile(filePath);
  }
}

export default CookieFixer; 