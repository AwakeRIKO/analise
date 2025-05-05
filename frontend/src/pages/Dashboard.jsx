import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaChartLine, FaHashtag, FaRegCalendarAlt, FaHome } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

// Registrar os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// URL da API - usar URL completa quando não estiver em localhost
const getApiUrl = () => {
  return window.location.hostname === 'localhost' 
    ? '/api' 
    : 'https://teste1.gestaoti.cloud/api';
};

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extrair username dos parâmetros da URL na montagem do componente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const usernameParam = searchParams.get('username');
    
    if (usernameParam) {
      setUsername(usernameParam);
      fetchProfileHistory(usernameParam);
    }
  }, [location]);

  // Função para formatar números grandes
  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Função para buscar histórico de um perfil específico
  const fetchProfileHistory = async (username) => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar histórico deste perfil usando a URL correta
      const response = await axios.get(`${getApiUrl()}/search-history?username=${username}`);
      setSearchHistory(response.data);
      
      // Se houver resultados, definir o perfil com o mais recente
      if (response.data.length > 0) {
        setProfileData(response.data[0]);
      } else {
        setError('Nenhum registro encontrado para este perfil');
        setProfileData(null);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError('Erro ao buscar dados. Tente novamente mais tarde.');
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para o gráfico de seguidores
  const prepareFollowersChartData = () => {
    if (!searchHistory || searchHistory.length < 2) return null;
    
    const sortedData = [...searchHistory].sort((a, b) => 
      new Date(a.search_timestamp) - new Date(b.search_timestamp)
    );
    
    return {
      labels: sortedData.map(item => {
        const date = new Date(item.search_timestamp);
        return date.toLocaleDateString('pt-BR');
      }),
      datasets: [
        {
          label: 'Seguidores',
          data: sortedData.map(item => item.followers),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3
        }
      ]
    };
  };

  // Configurações do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução de Seguidores'
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Atualizar URL com o novo username
      navigate(`/dashboard?username=${username.trim()}`);
      fetchProfileHistory(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white">
      {/* Cabeçalho da Dashboard */}
      <header className="py-6 bg-black bg-opacity-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <Link to="/analytics" className="text-white hover:text-pink-300 mr-4">
                <FaHome className="text-2xl" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Divulga Mais Brasil Dashboard</h1>
                <p className="text-white">Análise avançada de perfis do Instagram</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <form onSubmit={handleSearchSubmit} className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-purple-300" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2 bg-black bg-opacity-50 border border-purple-500 rounded-l text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Digite o @username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-r font-medium transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : <FaSearch />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Mensagem de erro, se houver */}
        {error && (
          <div className="bg-red-900 bg-opacity-70 border border-red-700 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg">Carregando dados...</span>
          </div>
        )}
        
        {/* Estatísticas do perfil */}
        {profileData && !loading && (
          <div className="mb-8">
            <div className="bg-black bg-opacity-50 rounded-lg p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-800 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                  {profileData.profile_picture_url ? (
                    <img 
                      src={window.location.hostname === 'localhost' 
                        ? `/api/profile-image/${profileData.username}?url=${encodeURIComponent(profileData.profile_picture_url)}`
                        : `../../foto/${profileData.username.toLowerCase()}.jpg`}
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null; // Prevenir loop
                        e.target.src = profileData.profile_picture_url || '/images/profile-placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900">
                      <FaUser className="text-4xl text-purple-300" />
                    </div>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">{profileData.full_name || profileData.username}</h2>
                  <p className="text-purple-300 mb-2">@{profileData.username}</p>
                  {profileData.bio && <p className="text-gray-300 mb-4">{profileData.bio}</p>}
                  <div className="text-xs text-gray-400">
                    <FaRegCalendarAlt className="inline mr-1" /> 
                    Última atualização: {new Date(profileData.search_timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-900 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{formatNumber(profileData.followers)}</div>
                  <div className="text-purple-300">Seguidores</div>
                </div>
                <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{formatNumber(profileData.following)}</div>
                  <div className="text-blue-300">Seguindo</div>
                </div>
                <div className="bg-indigo-900 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{formatNumber(profileData.posts || 0)}</div>
                  <div className="text-indigo-300">Publicações</div>
                </div>
              </div>
              
              <div className="mt-4 bg-black bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">Taxa de Engajamento</h3>
                  <div className="text-xl font-bold">
                    {profileData.engagement_rate ? (profileData.engagement_rate * 100).toFixed(2) : '0.00'}%
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min((profileData.engagement_rate || 0) * 100 * 5, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Média de mercado para perfis similares: ~2.5%
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Gráficos de evolução */}
        {searchHistory.length >= 2 && !loading && (
          <div className="bg-black bg-opacity-50 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-white">
              <FaChartLine className="mr-2 text-purple-400" />
              Evolução do Perfil
            </h2>
            
            <div className="h-80">
              {prepareFollowersChartData() && (
                <Line data={prepareFollowersChartData()} options={chartOptions} />
              )}
            </div>
          </div>
        )}
        
        {/* Histórico de consultas */}
        {searchHistory.length > 0 && !loading && (
          <div className="bg-black bg-opacity-50 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Histórico de Consultas</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-left">Data</th>
                    <th className="py-3 px-4 text-right">Seguidores</th>
                    <th className="py-3 px-4 text-right">Seguindo</th>
                    <th className="py-3 px-4 text-right">Posts</th>
                    <th className="py-3 px-4 text-right">Engajamento</th>
                  </tr>
                </thead>
                <tbody>
                  {searchHistory.map((record) => (
                    <tr key={record.id} className="border-b border-gray-800 hover:bg-purple-900 hover:bg-opacity-20">
                      <td className="py-3 px-4">
                        {new Date(record.search_timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">{formatNumber(record.followers)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(record.following)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(record.posts || 0)}</td>
                      <td className="py-3 px-4 text-right">
                        {(record.engagement_rate * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Exibir mensagem quando não houver dados nem erro nem loading */}
        {!profileData && !error && !loading && (
          <div className="bg-black bg-opacity-50 rounded-lg p-8 text-center">
            <FaSearch className="text-5xl text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Busque um perfil do Instagram</h2>
            <p className="text-gray-300 mb-4">
              Digite o nome de usuário no campo acima para visualizar suas estatísticas e histórico.
            </p>
            <Link 
              to="/analytics" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
            >
              Voltar para a página inicial
            </Link>
          </div>
        )}
      </main>
      
      <footer className="py-4 bg-black bg-opacity-30 text-center text-gray-400 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Divulga Mais Brasil - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 