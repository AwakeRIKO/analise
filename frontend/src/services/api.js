import requestQueue from './requestQueue';
import cookieManager from './cookieManager';
import axios from 'axios';

// URL da API modificada para apontar para o túnel Cloudflare do backend
const API_URL = 'https://teste1.gestaoti.cloud/api';
// Variável para determinar se deve usar o proxy local ou a URL remota
const USE_PROXY = window.location.hostname === 'localhost';

/**
 * Serviço de API que utiliza a fila de requisições
 * para fazer chamadas HTTP de forma controlada
 */
class ApiService {
  constructor() {
    // Cookies inicialmente fornecidos pelo usuário
    const defaultCookies = [{"domain":".instagram.com","expirationDate":1779932340.519436,"hostOnly":false,"httpOnly":false,"name":"csrftoken","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"YcIe5uEG66tQO7rGuMINep"},{"domain":".instagram.com","expirationDate":1779932252.200092,"hostOnly":false,"httpOnly":true,"name":"datr","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"W0QIaNlgJ7cmJiDOmsjJuMEH"},{"domain":".instagram.com","expirationDate":1776908301.006849,"hostOnly":false,"httpOnly":true,"name":"ig_did","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"8C11E719-8413-4553-86E4-3BA268CB100E"},{"domain":".instagram.com","expirationDate":1745977110,"hostOnly":false,"httpOnly":false,"name":"wd","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":"0","value":"1920x911"},{"domain":".instagram.com","expirationDate":1779932253,"hostOnly":false,"httpOnly":false,"name":"mid","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"aAhEWwALAAG7g8NCj2t9EOkwhhvy"},{"domain":".instagram.com","expirationDate":1776908301.0067,"hostOnly":false,"httpOnly":true,"name":"sessionid","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"51001477766%3AgLIQ1brOT8WBB8%3A14%3AAYc2zB0t2aFk7Zdqxz_0MmVjaLZRSmkvdi8b-AzBpg"},{"domain":".instagram.com","expirationDate":1753148340.519557,"hostOnly":false,"httpOnly":false,"name":"ds_user_id","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"51001477766"},{"domain":".instagram.com","hostOnly":false,"httpOnly":true,"name":"rur","path":"/","sameSite":"lax","secure":true,"session":true,"storeId":"0","value":"\"LDC\\05451001477766\\0541776908340:01f7943daf058f77d6e13ad1781dc8c7cc4f7afd690939faa1f11c28390c7c4c8c2930ed\""}];
    
    // Tenta definir os cookies padrão se não houver cookies carregados
    if (!cookieManager.isAuthenticated) {
      cookieManager.setCookies(defaultCookies);
    }
  }
  
  /**
   * Executa uma requisição GET com fila
   * @param {string} url - URL da requisição
   * @param {Object} options - Opções da requisição e da fila
   * @returns {Promise} - Promise com o resultado da requisição
   */
  async get(url, options = {}) {
    const { priority, headers, useAuth = true, ...fetchOptions } = options;
    
    // Garantir que estamos usando caminhos relativos
    let cleanUrl = url;
    if (url.includes('localhost')) {
      cleanUrl = url.replace(/https?:\/\/localhost:[0-9]+\/api/, '');
    }
    
    // Definir a URL completa com base no ambiente
    let fullUrl;
    if (USE_PROXY) {
      // Em ambiente de desenvolvimento local, use o proxy do Vite
      fullUrl = '/api' + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    } else {
      // Em ambiente de produção, use a URL completa do Cloudflare
      fullUrl = API_URL + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
    
    // Adiciona cookies de autenticação se necessário
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    // Adiciona o cabeçalho de cookies se estiver autenticado e a opção useAuth for true
    if (useAuth && cookieManager.isAuthenticated) {
      requestHeaders['Instagram-Cookies'] = cookieManager.getFormattedCookies();
    }
    
    console.log('Fazendo requisição para:', fullUrl);
    
    return requestQueue.enqueue(
      () => fetch(fullUrl, {
        method: 'GET',
        headers: requestHeaders,
        ...fetchOptions
      }).then(this._handleResponse)
      .catch(error => {
        console.error(`Erro na requisição para ${fullUrl}:`, error);
        throw error;
      }),
      { priority }
    );
  }
  
  /**
   * Executa uma requisição POST com fila
   * @param {string} url - URL da requisição
   * @param {Object} data - Dados a serem enviados
   * @param {Object} options - Opções da requisição e da fila
   * @returns {Promise} - Promise com o resultado da requisição
   */
  async post(url, data, options = {}) {
    const { priority, headers, useAuth = true, ...fetchOptions } = options;
    
    // Garantir que estamos usando caminhos relativos
    let cleanUrl = url;
    if (url.includes('localhost')) {
      cleanUrl = url.replace(/https?:\/\/localhost:[0-9]+\/api/, '');
    }
    
    // Definir a URL completa com base no ambiente
    let fullUrl;
    if (USE_PROXY) {
      // Em ambiente de desenvolvimento local, use o proxy do Vite
      fullUrl = '/api' + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    } else {
      // Em ambiente de produção, use a URL completa do Cloudflare
      fullUrl = API_URL + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
    
    // Adiciona cookies de autenticação se necessário
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    // Adiciona o cabeçalho de cookies se estiver autenticado e a opção useAuth for true
    if (useAuth && cookieManager.isAuthenticated) {
      requestHeaders['Instagram-Cookies'] = cookieManager.getFormattedCookies();
    }
    
    return requestQueue.enqueue(
      () => fetch(fullUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(data),
        ...fetchOptions
      }).then(this._handleResponse),
      { priority }
    );
  }
  
  /**
   * Processa a resposta da requisição
   * @param {Response} response - Objeto de resposta do fetch
   * @returns {Promise} - Promise com os dados da resposta
   * @private
   */
  async _handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      // Tenta obter detalhes do erro
      let errorDetail = 'Erro desconhecido';
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const errorResponse = await response.json();
          errorDetail = errorResponse.message || errorResponse.error || JSON.stringify(errorResponse);
        } else {
          errorDetail = await response.text();
        }
      } catch (err) {
        errorDetail = `Status ${response.status}: ${response.statusText}`;
      }
      
      const error = new Error(errorDetail);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    
    // Retorna dados conforme o tipo de conteúdo
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }
  
  /**
   * Busca o perfil do Instagram com a fila
   * @param {string} username - Nome de usuário do Instagram
   * @returns {Promise} - Promise com os dados do perfil
   */
  getProfile(username) {
    // Prioridade média para análise completa de perfil
    return this.get(`/profile/${username}`, { 
      priority: 1,
      useAuth: true // Usa cookies de autenticação
    });
  }
  
  /**
   * Verifica se um perfil existe (chamada mais leve)
   * @param {string} username - Nome de usuário do Instagram
   * @returns {Promise} - Promise com o resultado da verificação
   */
  checkProfile(username) {
    // Prioridade maior para verificações rápidas
    return this.get(`/check-profile/${username}`, { 
      priority: 2,
      useAuth: true // Usa cookies de autenticação
    });
  }
  
  /**
   * Verifica o status do servidor
   * @returns {Promise} - Promise com o status do servidor
   */
  checkServerStatus() {
    // Altíssima prioridade para verificações de status
    return this.get('/status', { 
      priority: 10,
      // Timeout menor para verificações de status
      signal: AbortSignal.timeout(3000),
      useAuth: false // Não precisa de autenticação
    }).catch((err) => {
      console.log('Erro ao verificar status do servidor:', err);
      return { status: 'offline' };
    });
  }
  
  /**
   * Atualiza os cookies de autenticação
   * @param {Array|String} cookies - Array de objetos de cookie ou string JSON
   * @returns {Promise<boolean>} - Se a operação foi bem-sucedida
   */
  async updateCookies(cookies) {
    return await cookieManager.setCookies(cookies);
  }
  
  /**
   * Verifica se está autenticado com o Instagram
   * @returns {boolean} - Se está autenticado
   */
  isAuthenticated() {
    return cookieManager.isAuthenticated && !cookieManager.isSessionExpired();
  }
}

// Exporta uma instância singleton
const api = new ApiService();

// Inicializa verificando se já temos cookies salvos
(async () => {
  try {
    await cookieManager.loadSavedCookies();
    
    // Verificar se modo 3 está ativo (persistência máxima)
    if (cookieManager.refreshMode === 3 && cookieManager.isAuthenticated) {
      console.log('Modo de persistência máxima ativo, sessão mantida');
    }
    
    // Verifica status da API ao inicializar
    api.checkServerStatus().catch(err => console.log('API não disponível', err));
  } catch (err) {
    console.error('Erro ao carregar cookies:', err);
  }
})();

export default api; 