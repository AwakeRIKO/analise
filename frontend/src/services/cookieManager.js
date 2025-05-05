/**
 * Gerenciador de cookies para autenticação no Instagram
 * Permite utilizar cookies de autenticação para requisições à API do Instagram
 */
import persistentStorage from './persistentStorage';

// Chaves para armazenamento
const COOKIES_KEY = 'instagram_cookies';
const TIMESTAMP_KEY = 'instagram_cookies_timestamp';
const REFRESH_MODE_KEY = 'instagram_refresh_mode';

class CookieManager {
  constructor() {
    this.cookies = null;
    this.lastUsed = null;
    this.isAuthenticated = false;
    this.refreshMode = 1; // 1: Padrão, 2: Renovar a cada uso, 3: Persistência máxima
  }

  /**
   * Define os cookies para autenticação
   * @param {Array|String} cookies - Array de objetos de cookie ou string JSON
   * @returns {boolean} - Sucesso da operação
   */
  async setCookies(cookies) {
    try {
      if (typeof cookies === 'string') {
        this.cookies = JSON.parse(cookies);
      } else {
        this.cookies = cookies;
      }
      
      this.lastUsed = new Date();
      this.isAuthenticated = this._validateCookies();
      
      // Salva cookies no armazenamento persistente
      if (this.isAuthenticated) {
        await persistentStorage.saveData(COOKIES_KEY, this.cookies);
        await persistentStorage.saveData(TIMESTAMP_KEY, this.lastUsed.toISOString());
        
        // Backup no localStorage para compatibilidade
        try {
          localStorage.setItem(COOKIES_KEY, JSON.stringify(this.cookies));
          localStorage.setItem(TIMESTAMP_KEY, this.lastUsed.toISOString());
        } catch (e) {
          console.warn('Não foi possível fazer backup no localStorage', e);
        }
      }
      
      return this.isAuthenticated;
    } catch (error) {
      console.error('Erro ao definir cookies:', error);
      this.cookies = null;
      this.isAuthenticated = false;
      return false;
    }
  }
  
  /**
   * Carrega cookies salvos do armazenamento persistente
   * @returns {Promise<boolean>} - Se há cookies válidos carregados
   */
  async loadSavedCookies() {
    try {
      // Tenta carregar do armazenamento persistente primeiro
      let savedCookies = await persistentStorage.getData(COOKIES_KEY);
      let timestamp = await persistentStorage.getData(TIMESTAMP_KEY);
      
      // Se não encontrar, tenta o localStorage como fallback
      if (!savedCookies) {
        savedCookies = localStorage.getItem(COOKIES_KEY);
        timestamp = localStorage.getItem(TIMESTAMP_KEY);
        
        // Se encontrou no localStorage, migra para armazenamento persistente
        if (savedCookies) {
          await persistentStorage.saveData(COOKIES_KEY, JSON.parse(savedCookies));
          if (timestamp) {
            await persistentStorage.saveData(TIMESTAMP_KEY, timestamp);
          }
        }
      }
      
      if (!savedCookies) return false;
      
      // Se savedCookies é uma string, converte para objeto
      if (typeof savedCookies === 'string') {
        savedCookies = JSON.parse(savedCookies);
      }
      
      this.cookies = savedCookies;
      this.lastUsed = timestamp ? new Date(timestamp) : new Date();
      this.isAuthenticated = this._validateCookies();
      
      // Carrega o modo de atualização
      const refreshMode = await persistentStorage.getData(REFRESH_MODE_KEY);
      if (refreshMode) {
        this.refreshMode = refreshMode;
      }
      
      return this.isAuthenticated;
    } catch (error) {
      console.error('Erro ao carregar cookies salvos:', error);
      return false;
    }
  }
  
  /**
   * Define o modo de atualização de cookies
   * @param {number} mode - 1: Padrão, 2: Renovar a cada uso, 3: Persistência máxima
   */
  async setRefreshMode(mode) {
    if (mode >= 1 && mode <= 3) {
      this.refreshMode = mode;
      await persistentStorage.saveData(REFRESH_MODE_KEY, mode);
      return true;
    }
    return false;
  }
  
  /**
   * Formata cookies para uso em cabeçalhos HTTP
   * @returns {string|null} - String formatada de cookies ou null se não autenticado
   */
  getFormattedCookies() {
    if (!this.isAuthenticated) return null;
    
    try {
      // No modo 3 (persistência máxima), atualiza o timestamp a cada uso
      if (this.refreshMode === 3) {
        this.lastUsed = new Date();
        persistentStorage.saveData(TIMESTAMP_KEY, this.lastUsed.toISOString());
      }
      
      return this.cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
    } catch (error) {
      console.error('Erro ao formatar cookies:', error);
      return null;
    }
  }
  
  /**
   * Verifica se os cookies são válidos para autenticação
   * @returns {boolean} - Se os cookies são válidos
   * @private
   */
  _validateCookies() {
    if (!this.cookies || !Array.isArray(this.cookies) || this.cookies.length === 0) {
      return false;
    }
    
    // Verifica se contém os cookies essenciais para autenticação
    const requiredCookies = ['sessionid', 'csrftoken', 'ds_user_id'];
    const cookieNames = this.cookies.map(c => c.name);
    
    return requiredCookies.every(name => cookieNames.includes(name));
  }
  
  /**
   * Verifica se a sessão está expirada
   * @returns {boolean} - Se a sessão está expirada
   */
  isSessionExpired() {
    if (!this.isAuthenticated) return true;
    
    // No modo 3 (persistência máxima), ignora a expiração
    if (this.refreshMode === 3) {
      return false;
    }
    
    // Verifica se algum cookie essencial está expirado
    const now = new Date();
    const sessionCookie = this.cookies.find(c => c.name === 'sessionid');
    
    if (!sessionCookie || !sessionCookie.expirationDate) return true;
    
    const expirationDate = new Date(sessionCookie.expirationDate * 1000);
    return expirationDate <= now;
  }
  
  /**
   * Limpa os cookies armazenados
   */
  async clearCookies() {
    this.cookies = null;
    this.lastUsed = null;
    this.isAuthenticated = false;
    
    await persistentStorage.removeData(COOKIES_KEY);
    await persistentStorage.removeData(TIMESTAMP_KEY);
    
    // Limpa também do localStorage
    localStorage.removeItem(COOKIES_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
  }
}

// Instância padrão para uso em toda a aplicação
const cookieManager = new CookieManager();

// Inicializa carregando cookies salvos, se houver
(async () => {
  await cookieManager.loadSavedCookies();
})();

export default cookieManager; 