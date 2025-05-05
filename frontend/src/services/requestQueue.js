/**
 * Serviço de fila de requisições para gerenciar chamadas API
 * 
 * Funcionalidades:
 * - Limita o número de requisições simultâneas
 * - Implementa backoff exponencial para retentativas
 * - Fornece feedback de posição na fila
 * - Priorização de requisições
 */

class RequestQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.retryLimit = options.retryLimit || 3;
    this.baseRetryDelay = options.baseRetryDelay || 1000;
    this.queue = [];
    this.running = 0;
    this.subscribers = [];
  }

  /**
   * Adiciona uma requisição à fila
   * @param {Function} requestFn - Função que retorna uma Promise com a requisição
   * @param {Object} options - Opções da requisição
   * @returns {Promise} - Promise que será resolvida quando a requisição for concluída
   */
  enqueue(requestFn, options = {}) {
    return new Promise((resolve, reject) => {
      const priority = options.priority || 0;
      const reqId = Date.now() + Math.random().toString(36).substring(2, 9);
      
      const request = {
        id: reqId,
        fn: requestFn,
        resolve,
        reject,
        priority,
        retryCount: 0,
        options,
        timestamp: Date.now()
      };

      // Adiciona à fila mantendo a ordenação por prioridade
      this.queue.push(request);
      this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
      
      this._notifySubscribers();
      this._processQueue();
      
      // Retorna a posição na fila para feedback ao usuário
      return this.getPositionInQueue(reqId);
    });
  }
  
  /**
   * Obtém a posição de uma requisição na fila
   * @param {string} requestId - ID da requisição
   * @returns {number} - Posição na fila (0 = em processamento, -1 = não encontrado)
   */
  getPositionInQueue(requestId) {
    const index = this.queue.findIndex(req => req.id === requestId);
    return index >= 0 ? index + 1 : (this.isProcessing(requestId) ? 0 : -1);
  }
  
  /**
   * Verifica se uma requisição está em processamento
   * @param {string} requestId - ID da requisição
   * @returns {boolean} - True se estiver processando
   */
  isProcessing(requestId) {
    return this.queue.some(req => req.id === requestId && req.processing);
  }
  
  /**
   * Processa a fila de requisições
   * @private
   */
  _processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Pega a próxima requisição da fila
    const request = this.queue.shift();
    this.running++;
    request.processing = true;
    
    this._notifySubscribers();
    
    // Executa a requisição
    this._executeRequest(request);
  }
  
  /**
   * Executa uma requisição com suporte a retry
   * @param {Object} request - Objeto de requisição
   * @private
   */
  _executeRequest(request) {
    request.fn()
      .then(result => {
        this.running--;
        request.processing = false;
        request.resolve(result);
        this._notifySubscribers();
        this._processQueue();
      })
      .catch(error => {
        // Tenta novamente com backoff exponencial se não excedeu o limite
        if (request.retryCount < this.retryLimit) {
          request.retryCount++;
          const delay = this.baseRetryDelay * Math.pow(2, request.retryCount - 1);
          
          setTimeout(() => {
            // Coloca de volta na fila com prioridade aumentada
            request.priority += 1;
            this.queue.unshift(request);
            this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
            this.running--;
            request.processing = false;
            this._notifySubscribers();
            this._processQueue();
          }, delay);
        } else {
          // Falhou após todas as tentativas
          this.running--;
          request.processing = false;
          request.reject(error);
          this._notifySubscribers();
          this._processQueue();
        }
      });
  }
  
  /**
   * Assina atualizações da fila
   * @param {Function} callback - Função chamada quando a fila é atualizada
   * @returns {Function} - Função para cancelar assinatura
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    callback({
      queueLength: this.queue.length,
      running: this.running,
      queue: this.queue.map(req => ({ id: req.id, priority: req.priority, timestamp: req.timestamp }))
    });
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
  
  /**
   * Notifica assinantes sobre mudanças na fila
   * @private
   */
  _notifySubscribers() {
    const queueState = {
      queueLength: this.queue.length,
      running: this.running,
      queue: this.queue.map(req => ({ id: req.id, priority: req.priority, timestamp: req.timestamp }))
    };
    
    this.subscribers.forEach(callback => callback(queueState));
  }
  
  /**
   * Limpa toda a fila
   */
  clearQueue() {
    const queuedRequests = [...this.queue];
    this.queue = [];
    
    // Rejeita todas as requisições pendentes
    queuedRequests.forEach(req => {
      req.reject(new Error('Requisição cancelada: fila foi limpa'));
    });
    
    this._notifySubscribers();
  }
}

// Exporta uma instância singleton para uso em toda a aplicação
const requestQueue = new RequestQueue();
export default requestQueue; 