import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CookieFixer from '../utils/cookieFixer.js';

// Configure __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gerenciador de contas do Instagram
 * Responsável por carregar, gerenciar e rotacionar contas
 */
class AccountManager {
  constructor() {
    this.accounts = [];
    this.currentIndex = 0;
  }
  
  /**
   * Carrega as contas do arquivo de cookies
   * @param {string} filePath Caminho para o arquivo cookie.txt
   * @returns {number} Número de contas carregadas
   */
  loadFromFile(filePath) {
    try {
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        console.error(`Arquivo de cookies não encontrado: ${filePath}`);
        return 0;
      }
      
      console.log(`Carregando cookies do arquivo: ${filePath}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Verifica se o arquivo está vazio
      if (!content.trim()) {
        console.error('Arquivo de cookies está vazio');
        return 0;
      }
      
      const lines = content.split('\n').filter(line => line.trim() !== '');
      console.log(`Encontradas ${lines.length} linhas no arquivo de cookies`);
      
      // Se não conseguir processar as contas corretamente, tenta corrigir o arquivo
      try {
        this.accounts = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Verifica o formato da linha
          if (line.includes('|')) {
            console.log(`Processando linha ${i+1} - formato username|cookies`);
            // Formato username|cookies
            const [username, cookie] = line.split('|').map(part => part.trim());
            
            try {
              // Validar o cookie como JSON válido
              const cookieJson = JSON.parse(cookie);
              
              // Verifica se o cookie é um array ou um objeto único
              if (Array.isArray(cookieJson)) {
                this.accounts.push({ username, cookie });
                console.log(`Cookie válido para usuário ${username} - array com ${cookieJson.length} itens`);
              } else if (typeof cookieJson === 'object') {
                // Se for um único objeto, converte para array
                const cookieArray = JSON.stringify([cookieJson]);
                this.accounts.push({ username, cookie: cookieArray });
                console.log(`Cookie válido para usuário ${username} - objeto único convertido para array`);
              }
            } catch (jsonError) {
              console.warn(`Erro JSON na linha ${i+1} para usuário ${username}: ${jsonError.message}`);
              throw jsonError; // Propaga o erro para o tratamento de correção
            }
          } else if (line.startsWith('[') && line.endsWith(']')) {
            // Formato JSON puro (array)
            console.log(`Processando linha ${i+1} - formato JSON array`);
            try {
              const cookieJson = JSON.parse(line);
              // Tenta extrair o username do cookie sessionid
              let username = `user_${i+1}`;
              
              for (const cookie of cookieJson) {
                if (cookie.name === 'sessionid' && cookie.value) {
                  const parts = cookie.value.split('%3A');
                  if (parts.length > 0) {
                    username = parts[0];
                    break;
                  }
                }
              }
              
              this.accounts.push({ username, cookie: line });
              console.log(`Cookie JSON array válido - usuário extraído: ${username}`);
            } catch (jsonError) {
              console.warn(`Erro JSON na linha ${i+1}: ${jsonError.message}`);
              throw jsonError; // Propaga o erro para o tratamento de correção
            }
          } else if (line.startsWith('{') && line.endsWith('}')) {
            // Formato JSON puro (objeto único)
            console.log(`Processando linha ${i+1} - formato JSON objeto`);
            try {
              const cookieObj = JSON.parse(line);
              // Converte para array
              const cookieArray = JSON.stringify([cookieObj]);
              
              // Define um username genérico
              const username = `user_${i+1}`;
              this.accounts.push({ username, cookie: cookieArray });
              console.log(`Cookie objeto único válido - convertido para array`);
            } catch (jsonError) {
              console.warn(`Erro JSON na linha ${i+1}: ${jsonError.message}`);
              throw jsonError; // Propaga o erro para o tratamento de correção
            }
          } else {
            console.warn(`Formato não reconhecido na linha ${i+1}`);
          }
        }
        
        if (this.accounts.length === 0) {
          throw new Error('Nenhuma conta válida processada');
        }
        
      } catch (parseError) {
        console.warn(`Erro ao processar cookies do arquivo ${filePath}:`, parseError.message);
        console.log('Tentando corrigir arquivo de cookies automaticamente...');
        
        // Tentar corrigir o arquivo e carregar novamente
        if (CookieFixer.fixCookieFile(filePath)) {
          console.log('Arquivo corrigido, recarregando contas...');
          content = fs.readFileSync(filePath, 'utf8');
          const fixedLines = content.split('\n').filter(line => line.trim() !== '');
          
          this.accounts = fixedLines.map(line => {
            try {
              const [username, cookie] = line.split('|').map(part => part.trim());
              return { username, cookie };
            } catch (e) {
              console.error('Erro ao processar linha:', e.message);
              return null;
            }
          }).filter(account => account !== null);
        } else {
          console.error('Não foi possível corrigir o arquivo de cookies');
        }
      }
      
      console.log(`Carregadas ${this.accounts.length} contas do Instagram`);
      return this.accounts.length;
    } catch (error) {
      console.error('Erro ao carregar arquivo de cookies:', error);
      return 0;
    }
  }
  
  /**
   * Alias para loadFromFile para manter compatibilidade com a API
   * @returns {boolean} Sucesso na operação
   */
  async loadAccountsFromFile() {
    try {
      const filePath = process.env.COOKIES_FILE_PATH || './cookies.txt';
      const count = this.loadFromFile(filePath);
      return count > 0;
    } catch (error) {
      console.error('Erro ao carregar contas do arquivo:', error);
      return false;
    }
  }
  
  /**
   * Obtém a próxima conta na rotação
   * @returns {Object|null} Objeto com username e cookie
   */
  getNextAccount() {
    if (this.accounts.length === 0) {
      console.warn('Nenhuma conta disponível para uso');
      return null;
    }

    // Verificar se temos contas sem problema para usar
    const availableAccounts = this.accounts.filter(acc => !acc.problematic);
    
    if (availableAccounts.length === 0) {
      console.warn('Todas as contas estão marcadas como problemáticas. Usando a primeira da lista.');
      // Se todas estiverem com problema, usar a menos problemática (a primeira da lista)
      const account = this.accounts[0];
      console.log(`Rotação de contas: Usando conta ${account.username} (todas contas com problemas)`);
      
      // Avança para a próxima conta em modo circular
      this.currentIndex = (this.currentIndex + 1) % this.accounts.length;
      
      return account;
    }
    
    // Usar apenas as contas sem problemas para rotação
    const availableIndex = this.currentIndex % availableAccounts.length;
    const account = availableAccounts[availableIndex];
    
    console.log(`Rotação de contas: Usando conta ${account.username} (${availableIndex + 1}/${availableAccounts.length} disponíveis)`);
    
    // Avança para a próxima conta em modo circular
    this.currentIndex = (this.currentIndex + 1) % this.accounts.length;
    
    return account;
  }
  
  /**
   * Marcar uma conta como com problema
   * @param {string} username Nome da conta com problema
   */
  markAccountAsProblematic(username) {
    const accountIndex = this.accounts.findIndex(acc => acc.username === username);
    if (accountIndex !== -1) {
      // Movemos a conta para o final da lista
      const account = this.accounts.splice(accountIndex, 1)[0];
      account.problematic = true;
      account.lastError = new Date();
      this.accounts.push(account);
      
      console.log(`Conta ${username} marcada como problemática e movida para o final da fila`);
    }
  }
  
  /**
   * Obtém o número total de contas disponíveis
   * @returns {number} Número de contas
   */
  getAccountCount() {
    return this.accounts.length;
  }
  
  /**
   * Obtém estatísticas sobre as contas carregadas
   * @returns {Object} Estatísticas das contas
   */
  getStats() {
    if (this.accounts.length === 0) {
      return null;
    }
    
    const problematicAccounts = this.accounts.filter(acc => acc.problematic);
    
    return {
      total: this.accounts.length,
      active: this.accounts.length - problematicAccounts.length,
      problematic: problematicAccounts.length,
      currentIndex: this.currentIndex
    };
  }
  
  /**
   * Obtém cookies formatados para uso em requisições
   * @returns {Array|null} Array de cookies formatados ou null
   */
  getFormattedCookies() {
    const account = this.getNextAccount();
    if (!account || !account.cookie) {
      console.warn('Nenhuma conta disponível ou cookie válido');
      return null;
    }
    
    try {
      console.log(`Formatando cookies para conta ${account.username}`);
      // Tenta parsear o cookie como JSON
      const parsed = JSON.parse(account.cookie);
      
      // Verifica se é array ou objeto único
      if (Array.isArray(parsed)) {
        console.log(`Retornando array de cookies com ${parsed.length} itens`);
        return parsed;
      } else if (typeof parsed === 'object') {
        // Se for um único objeto, retorna como array
        console.log('Retornando cookie único como array');
        return [parsed];
      }
      
      console.warn('Formato de cookie desconhecido');
      return null;
    } catch (error) {
      console.error('Erro ao formatar cookies:', error);
      // Se não for JSON, retorna o cookie como string
      return account.cookie;
    }
  }
}

// Singleton para ser usado em todo o backend
const accountManager = new AccountManager();

// Exportação compatível com ES modules
export default accountManager; 