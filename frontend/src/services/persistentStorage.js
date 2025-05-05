/**
 * Serviço para armazenamento persistente usando IndexedDB
 * Oferece persistência mais robusta que localStorage
 */

// Nome do banco de dados e store
const DB_NAME = 'instagram_analyzer_db';
const STORE_NAME = 'cookies_store';
const DB_VERSION = 1;

// Inicializar o banco de dados
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event);
      reject('Erro ao abrir o banco de dados');
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Salva dados no IndexedDB
 * @param {string} key - Chave para os dados
 * @param {any} data - Dados a serem salvos
 * @returns {Promise} - Promise que resolve quando os dados forem salvos
 */
const saveData = async (key, data) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put({
        id: key,
        data: data,
        timestamp: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        console.error('Erro ao salvar dados:', event);
        reject('Erro ao salvar dados');
      };
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    // Fallback para localStorage
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Erro no fallback para localStorage:', err);
      return false;
    }
  }
};

/**
 * Recupera dados do IndexedDB
 * @param {string} key - Chave dos dados a recuperar
 * @returns {Promise} - Promise que resolve com os dados
 */
const getData = async (key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(key);
      
      request.onsuccess = (event) => {
        const result = event.target.result;
        resolve(result ? result.data : null);
      };
      
      request.onerror = (event) => {
        console.error('Erro ao recuperar dados:', event);
        reject('Erro ao recuperar dados');
      };
    });
  } catch (error) {
    console.error('Erro ao recuperar dados:', error);
    // Fallback para localStorage
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Erro no fallback para localStorage:', err);
      return null;
    }
  }
};

/**
 * Remove dados do IndexedDB
 * @param {string} key - Chave dos dados a remover
 * @returns {Promise} - Promise que resolve quando os dados forem removidos
 */
const removeData = async (key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        console.error('Erro ao remover dados:', event);
        reject('Erro ao remover dados');
      };
    });
  } catch (error) {
    console.error('Erro ao remover dados:', error);
    // Fallback para localStorage
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error('Erro no fallback para localStorage:', err);
      return false;
    }
  }
};

export default {
  saveData,
  getData,
  removeData
}; 