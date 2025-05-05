import { useState, useEffect } from 'react';
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import api from '../services/api';
import cookieManager from '../services/cookieManager';

/**
 * Componente para configuração de autenticação com o Instagram
 * Acessível apenas para administradores
 */
const AuthConfig = () => {
  const [cookies, setCookies] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshMode, setRefreshMode] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  useEffect(() => {
    // Verifica se o usuário é administrador (pelo localStorage ou por outra forma de autenticação)
    const checkAdminStatus = async () => {
      const isAdminUser = localStorage.getItem('is_admin') === 'true';
      setIsAdmin(isAdminUser);
      
      // Se for admin, verifica autenticação atual
      if (isAdminUser) {
        setIsAuthenticated(api.isAuthenticated());
        
        // Carrega modo de atualização atual
        setRefreshMode(cookieManager.refreshMode || 1);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  const handleSaveCookies = async () => {
    try {
      setSaveStatus({ type: 'loading', message: 'Salvando...' });
      
      // Tenta definir os cookies
      const success = await api.updateCookies(cookies);
      
      if (success) {
        setIsAuthenticated(true);
        setSaveStatus({ 
          type: 'success', 
          message: 'Cookies de autenticação atualizados com sucesso' 
        });
        
        // Salva flag de admin no localStorage
        localStorage.setItem('is_admin', 'true');
        setIsAdmin(true);
        
        // Esconde configuração após alguns segundos
        setTimeout(() => {
          setShowConfig(false);
          setSaveStatus(null);
        }, 3000);
      } else {
        setSaveStatus({ 
          type: 'error', 
          message: 'Formato inválido de cookies ou cookies insuficientes para autenticação' 
        });
      }
    } catch (error) {
      console.error('Erro ao salvar cookies:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Ocorreu um erro ao salvar os cookies: ' + error.message
      });
    }
  };
  
  const handleRefreshModeChange = async (newMode) => {
    try {
      setSaveStatus({ type: 'loading', message: 'Salvando modo de atualização...' });
      
      // Define o novo modo de atualização
      const success = await cookieManager.setRefreshMode(parseInt(newMode));
      
      if (success) {
        setRefreshMode(parseInt(newMode));
        setSaveStatus({ 
          type: 'success', 
          message: 'Modo de persistência atualizado com sucesso!' 
        });
        
        setTimeout(() => {
          setSaveStatus(null);
        }, 3000);
      } else {
        setSaveStatus({ 
          type: 'error', 
          message: 'Modo de persistência inválido' 
        });
      }
    } catch (error) {
      console.error('Erro ao definir modo de atualização:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Ocorreu um erro ao definir o modo de persistência' 
      });
    }
  };
  
  const toggleConfigView = () => {
    // Requer senha para mostrar configuração (simples)
    if (!showConfig && !isAdmin) {
      const password = prompt('Digite a senha de administrador:');
      if (password === 'admin123') { // Senha simples para demonstração
        setIsAdmin(true);
        localStorage.setItem('is_admin', 'true');
        setShowConfig(true);
      } else {
        alert('Senha incorreta!');
      }
    } else {
      setShowConfig(!showConfig);
    }
  };
  
  // Componente não visível para não-admins se não estiver expandido
  if (!isAdmin && !showConfig) {
    return null;
  }
  
  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      {/* Cabeçalho clicável */}
      <div 
        className="bg-primary-dark text-white p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleConfigView}
      >
        <div className="flex items-center">
          <FaLock className="mr-2" />
          <h3 className="font-semibold">Configuração de Autenticação Instagram</h3>
        </div>
        <div className="flex items-center">
          {isAuthenticated && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full mr-2 flex items-center">
              <FaCheckCircle className="mr-1" size={10} /> Autenticado
            </span>
          )}
          <span className="text-sm">
            {showConfig ? '▲' : '▼'}
          </span>
        </div>
      </div>
      
      {/* Painel de configuração */}
      {showConfig && (
        <div className="p-4 bg-white">
          <p className="text-gray-600 text-sm mb-4">
            Cole aqui os cookies de autenticação do Instagram para permitir o acesso direto à API.
            Isso evita bloqueios e limites de taxa por parte do Instagram.
          </p>
          
          <textarea 
            className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-xs"
            placeholder='[{"domain": ".instagram.com", "name": "sessionid", "value": "..."}]'
            value={cookies}
            onChange={(e) => setCookies(e.target.value)}
          />
          
          {/* Configurações avançadas */}
          <div className="mt-4">
            <div className="flex items-center cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
              <FaCog className="text-gray-600 mr-2" />
              <span className="text-gray-700 font-medium">Configurações avançadas</span>
              <span className="ml-2 text-xs">{showAdvanced ? '▲' : '▼'}</span>
            </div>
            
            {showAdvanced && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modo de persistência de cookies:
                  </label>
                  <select 
                    value={refreshMode} 
                    onChange={(e) => handleRefreshModeChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="1">Modo 1: Padrão (Respeita expiração normal)</option>
                    <option value="2">Modo 2: Renovação em cada uso</option>
                    <option value="3">Modo 3: Persistência máxima (Mantém sessão indefinidamente)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    O modo 3 vai ignorar a expiração normal dos cookies, mantendo a sessão por muito mais tempo.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {saveStatus && (
            <div className={`mt-3 p-3 rounded-md ${
              saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 
              saveStatus.type === 'error' ? 'bg-red-50 text-red-700' : 
              'bg-blue-50 text-blue-700'
            }`}>
              {saveStatus.type === 'error' && <FaExclamationTriangle className="inline mr-2" />}
              {saveStatus.type === 'success' && <FaCheckCircle className="inline mr-2" />}
              {saveStatus.message}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              className="btn btn-outline mr-2"
              onClick={() => setShowConfig(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveCookies}
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthConfig; 