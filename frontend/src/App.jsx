import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProfileSearchInput from './components/ProfileSearchInput'
import InstagramAnalyzer from './components/InstagramAnalyzer'
import LoadingScreen from './components/LoadingScreen'
import ErrorMessage from './components/ErrorMessage'
import QueueStatus from './components/QueueStatus'
import { FaWhatsapp, FaEnvelope, FaChartLine, FaBars, FaTimes } from 'react-icons/fa'
import api from './services/api'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [usernameToAnalyze, setUsernameToAnalyze] = useState('')
  const [serverStatus, setServerStatus] = useState('checking')
  const [requestId, setRequestId] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Verificar o status do servidor ao iniciar
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Tentar verificar o status do servidor, mas ignorar erros de conexão
        const response = await api.checkServerStatus();
        setServerStatus(response.status === 'online' ? 'online' : 'offline');
      } catch (error) {
        console.log('Erro ao verificar status do servidor:', error);
        // Como estamos usando o Cloudflare Tunnel, podemos presumir que o servidor está online
        // mesmo que não consigamos verificar diretamente
        setServerStatus('presumed_online');
      }
    };

    // Executar imediatamente
    checkServerStatus();
    
    // Verificar periodicamente
    const interval = setInterval(checkServerStatus, 60000);
    
    // Limpar o intervalo ao desmontar
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (username) => {
    if (!username || username.trim() === '') {
      setError('Por favor, digite um nome de usuário válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRequestId(null);
    
    try {
      // Verificar se o servidor está offline explicitamente
      // Mas permitir "presumed_online" para contornar problemas com o Cloudflare Tunnel
      if (serverStatus === 'offline') {
        throw new Error('O servidor está offline. Tente novamente mais tarde.');
      }

      // Criar um ID único para esta requisição
      const reqId = `profile-${Date.now()}`;
      setRequestId(reqId);
      
      // Prosseguir para análise
      setUsernameToAnalyze(username.trim());
      setShowAnalyzer(true);
    } catch (error) {
      console.error('Erro ao preparar análise:', error);
      setError(error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
      setRequestId(null);
    } finally {
      setLoading(false);
    }
  }

  const handleReturnToSearch = () => {
    setShowAnalyzer(false);
    setUsernameToAnalyze('');
    setError(null);
    setRequestId(null);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Cabeçalho Principal */}
      <header className="divulga-header py-4 md:py-5">
        <div className="container-custom">
          <div className="flex justify-between items-center">
            <img 
              src="/images/divulga-mais-logo.png" 
              alt="Divulga Mais" 
              className="h-10 md:h-12 lg:h-14 w-auto object-contain"
            />
            
            {/* Botão do menu mobile */}
            <button 
              className="md:hidden text-white p-2" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            
            {/* Menu desktop */}
            <div className="hidden md:flex space-x-4">
              <a href="https://divulgamaisbrasil.com/" className="text-white hover:text-divulga-light font-medium">A Agência</a>
              <a href="https://divulgamaisbrasil.com/representante/" className="text-white hover:text-divulga-light font-medium">Representante</a>
              <a href="https://divulgamaisbrasil.com/portfolio/" className="text-white hover:text-divulga-light font-medium">Portfólio</a>
              <a href="https://api.whatsapp.com/message/ZSEPTV4YE5ZHH1?autoload=1&app_absent=0" className="text-white hover:text-divulga-light font-medium">Contato</a>
              <Link to="/analytics" className="flex items-center bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-1 rounded-full text-white hover:from-purple-700 hover:to-purple-900 transition-colors">
                <FaChartLine className="mr-2" /> Dashboard
              </Link>
            </div>
          </div>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-primary-dark py-4 px-2 mt-2 rounded-md shadow-lg">
              <nav className="flex flex-col space-y-3">
                <a href="https://divulgamaisbrasil.com/" className="text-white hover:text-divulga-light font-medium px-3 py-2">A Agência</a>
                <a href="https://divulgamaisbrasil.com/representante/" className="text-white hover:text-divulga-light font-medium px-3 py-2">Representante</a>
                <a href="https://divulgamaisbrasil.com/portfolio/" className="text-white hover:text-divulga-light font-medium px-3 py-2">Portfólio</a>
                <a href="https://api.whatsapp.com/message/ZSEPTV4YE5ZHH1?autoload=1&app_absent=0" className="text-white hover:text-divulga-light font-medium px-3 py-2">Contato</a>
                <Link to="/analytics" className="flex items-center bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-2 rounded-md text-white hover:from-purple-700 hover:to-purple-900 transition-colors mx-2">
                  <FaChartLine className="mr-2" /> Dashboard
                </Link>
              </nav>
            </div>
          )}

          {serverStatus === 'offline' && (
            <div className="mt-2 text-red-200 text-xs md:text-sm text-center md:text-right">
              Servidor offline. Algumas funcionalidades podem estar indisponíveis.
            </div>
          )}
        </div>
      </header>
      
      {/* Banner principal - somente na página inicial */}
      {!showAnalyzer && !loading && !error && (
        <div className="bg-divulga-light py-8 md:py-12 lg:py-20">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-6 md:mb-0 text-center md:text-left px-4 md:px-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-primary-dark">
                  Análise de perfil do Instagram
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 md:mb-6">
                  Descubra oportunidades de crescimento e insights valiosos para melhorar seu perfil no Instagram
                </p>
                <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
                  Ferramenta profissional desenvolvida pela Divulga Mais Brasil
                </p>
              </div>
              <div className="w-full md:w-1/2 md:pl-8 lg:pl-12 px-4 md:px-0">
                <ProfileSearchInput onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="container-custom py-8 flex-grow">
        {/* Exibir status da fila se tiver uma requisição ativa */}
        <QueueStatus requestId={requestId} active={loading || showAnalyzer} />
        
        {!showAnalyzer && loading && <LoadingScreen />}
        
        {!showAnalyzer && error && <ErrorMessage message={error} />}
        
        {showAnalyzer && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InstagramAnalyzer 
              initialUsername={usernameToAnalyze} 
              onReturn={handleReturnToSearch}
              requestId={requestId}
            />
          </motion.div>
        )}
      </main>
      
      <footer className="bg-primary-dark text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center sm:text-left">
              <img 
                src="/images/divulga-mais-logo.png" 
                alt="Divulga Mais" 
                className="h-10 md:h-12 w-auto object-contain mx-auto sm:mx-0 mb-4 bg-white p-2 rounded"
              />
              <p className="text-sm text-gray-300 mb-4 px-4 sm:px-0">
                A Divulga Mais Brasil é uma agência de geração de conteúdo direcionado 
                para as grandes mídias digitais.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-3 md:mb-4 text-white">Contato</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center justify-center sm:justify-start">
                  <FaWhatsapp className="mr-2" />
                  (16) 99638-2502
                </li>
                <li className="flex items-center justify-center sm:justify-start">
                  <FaEnvelope className="mr-2" />
                  contato@divulgamaisbrasil.com
                </li>
              </ul>
            </div>
            
            <div className="text-center sm:text-left mt-4 sm:mt-0">
              <h3 className="text-lg font-semibold mb-3 md:mb-4 text-white">Links Rápidos</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://divulgamaisbrasil.com/" className="hover:text-white">A Agência</a></li>
                <li><a href="https://divulgamaisbrasil.com/social-media/" className="hover:text-white">Social Media</a></li>
                <li><a href="https://divulgamaisbrasil.com/portfolio/" className="hover:text-white">Portfólio</a></li>
                <li><a href="https://divulgamaisbrasil.com/blog/" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-4 text-center text-xs sm:text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Divulga Mais Brasil - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App 