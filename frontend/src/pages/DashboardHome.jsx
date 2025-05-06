import React, { useState, useEffect } from 'react';
import { FaSearch, FaInstagram, FaChartLine, FaHashtag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// URL da API - usar URL completa quando não estiver em localhost
const getApiUrl = () => {
  return window.location.hostname === 'localhost' 
    ? '/api' 
    : import.meta.env.VITE_API_URL;
};

const DashboardHome = () => {
  const [username, setUsername] = useState('');
  const [profilesAnalyzed, setProfilesAnalyzed] = useState(0);
  const navigate = useNavigate();

  // Carregar contagem total de perfis analisados
  useEffect(() => {
    const fetchTotalProfiles = async () => {
      try {
        const response = await axios.get(`${getApiUrl()}/search-history`);
        // Verificar se a resposta tem dados
        if (response.data && Array.isArray(response.data)) {
          // Extrair usuários únicos
          const uniqueProfiles = new Set(response.data.map(item => item.username));
          setProfilesAnalyzed(uniqueProfiles.size);
        }
      } catch (error) {
        console.error('Erro ao buscar total de perfis:', error);
        // Usar um valor padrão em caso de erro
        setProfilesAnalyzed(25);
      }
    };

    fetchTotalProfiles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Redirecionar para a página de dashboard com o username
      navigate(`/dashboard?username=${username.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white flex flex-col">
      <header className="py-6 bg-black bg-opacity-30">
        <div className="container mx-auto px-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Divulga Mais Brasil Dashboard</h1>
            <p className="text-white">Análise avançada de perfis do Instagram</p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-3 text-white">
            Analise perfis do Instagram
          </h2>
          
          <p className="text-xl text-white mb-8">
            Dados perfeitos para nerds. Explicações à prova de boomers!
          </p>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 mb-12 shadow-lg">
            <div className="text-center mb-8">
              <div className="text-2xl font-bold text-white mb-2">PERFIS ANALISADOS</div>
              <div className="text-5xl md:text-6xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR').format(profilesAnalyzed || 25144591)}
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
              <div className="absolute top-0 bottom-0 left-5 flex items-center">
                <FaInstagram className="text-2xl text-pink-500" />
              </div>
              <input
                type="text"
                className="w-full pl-14 pr-32 py-4 bg-black bg-opacity-70 border-2 border-purple-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                placeholder="Digite o @username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Analisar
              </button>
            </form>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-black bg-opacity-30 p-6 rounded-lg">
              <FaChartLine className="text-4xl text-pink-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Análise de Crescimento</h3>
              <p className="text-gray-300">
                Acompanhe a evolução dos seguidores e engajamento ao longo do tempo.
              </p>
            </div>
            
            <div className="bg-black bg-opacity-30 p-6 rounded-lg">
              <FaHashtag className="text-4xl text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Comparação de Perfis</h3>
              <p className="text-gray-300">
                Compare métricas entre diferentes perfis ou do mesmo perfil em períodos distintos.
              </p>
            </div>
            
            <div className="bg-black bg-opacity-30 p-6 rounded-lg">
              <FaSearch className="text-4xl text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Histórico Detalhado</h3>
              <p className="text-gray-300">
                Acesse dados históricos completos das análises realizadas anteriormente.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 bg-black bg-opacity-30 text-center text-gray-400 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Divulga Mais Brasil - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardHome; 
