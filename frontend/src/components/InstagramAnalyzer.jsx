import { useState, useEffect } from 'react';
import { FaUser, FaSearch, FaSpinner, FaExclamationTriangle, FaBrain, FaPrint, FaShareAlt, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ServicesRecommendation from './ServicesRecommendation';
import BioAnalyzer from './BioAnalyzer';

const InstagramAnalyzer = ({ initialUsername = '' }) => {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Função para formatar números grandes (milhões e milhares)
  const formatLargeNumber = (num) => {
    if (!num && num !== 0) return "0";
    
    // Para números em milhões (1.000.000 ou mais)
    if (num >= 1000000) {
      const millions = (num / 1000000).toLocaleString('pt-BR', { 
        maximumFractionDigits: 1,
        minimumFractionDigits: 1 
      });
      return `${millions} mi`;
    }
    
    // Para números em milhares (1.000 ou mais)
    if (num >= 1000) {
      const thousands = (num / 1000).toLocaleString('pt-BR', { 
        maximumFractionDigits: 1,
        minimumFractionDigits: 1 
      });
      return `${thousands} mil`;
    }
    
    // Para números menores, formatar com separador de milhar
    return num.toLocaleString('pt-BR');
  };

  // Realizar análise automática ao receber nome de usuário
  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
      performAnalysis(initialUsername);
    }
  }, [initialUsername]);

  const performAnalysis = async (usernameToAnalyze) => {
    if (!usernameToAnalyze.trim()) {
      setError('Por favor, digite um nome de usuário válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Usar a API correta para análise
      const response = await fetch(`/api/profile/${usernameToAnalyze.trim()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar o perfil');
      }
      
      console.log("Dados recebidos:", data);
      
      // Transformar os dados para o formato esperado pelo componente
      const formattedData = {
        username: data.username,
        fullName: data.fullName || data.username,
        profilePicture: data.profilePicture,
        accountType: data.followersCount > 10000 ? "Influenciador" : "Pessoal",
        contentCategories: ["Geral"],
        postFrequency: data.postsCount > 50 ? "Frequente" : "Ocasional",
        hasBio: Boolean(data.bio && !data.bio.includes("não encontrada")),
        hasLink: Boolean(data.profileUrl),
        hasHighlights: true,
        statsSnapshot: {
          followers: data.followersCount || 0,
          following: data.followingCount || 0,
          posts: data.postsCount || 0,
          engagementRate: data.engagementRate ? `${(data.engagementRate * 100).toFixed(1)}%` : "4.5%"
        },
        recommendations: Array.isArray(data.aiAnalysis) ? data.aiAnalysis : [],
        isAiAnalysis: Boolean(data.aiAnalysis),
        analysisDate: new Date().toISOString()
      };
      
      setAnalysis(formattedData);
    } catch (err) {
      console.error("Erro na análise:", err);
      setError(err.message || 'Ocorreu um erro ao analisar o perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performAnalysis(username);
  };
  
  const handleReturn = () => {
    // Redefinir o estado local e permitir retornar à página inicial
    setAnalysis(null);
    setError(null);
    
    // Recarregar a página para voltar à página inicial
    window.location.reload();
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // Criar um arquivo JSON para download
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `instagram-analise-${analysis.username}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleShare = () => {
    // Se a API de compartilhamento estiver disponível
    if (navigator.share) {
      navigator.share({
        title: `Análise de Instagram para @${analysis.username}`,
        text: `Confira esta análise de perfil do Instagram para @${analysis.username}`,
        url: window.location.href
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('URL copiada para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar URL:', err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-instagram-purple mb-2">
          Analisador de Perfil do Instagram
        </h1>
        <p className="text-gray-600">
          Obtenha recomendações instantâneas para melhorar seu perfil
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center bg-white rounded-full shadow-md p-2">
          <div className="bg-gray-100 p-2 rounded-full">
            <FaUser className="text-instagram-purple" />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite o nome de usuário do Instagram (sem @)"
            className="flex-grow px-4 py-2 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-instagram-gradient text-white px-6 py-2 rounded-full font-medium flex items-center"
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSearch className="mr-2" />
            )}
            {loading ? 'Analisando...' : 'Analisar'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-500 flex items-center justify-center">
            <FaExclamationTriangle className="mr-2" /> {error}
          </div>
        )}
      </form>
      
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 print:shadow-none"
        >
          {/* Botão para voltar */}
          <div className="mb-4 print:hidden">
            <button
              onClick={handleReturn}
              className="flex items-center text-instagram-purple hover:text-instagram-darkPurple"
            >
              <FaArrowLeft className="mr-1" /> Voltar
            </button>
          </div>
          
          {/* Cabeçalho do relatório */}
          <div className="flex justify-between items-center mb-6 border-b pb-4 print:border-b-2">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-instagram-purple mr-4">
                {analysis.profilePicture ? (
                  <img 
                    src={analysis.profilePicture} 
                    alt={`Foto de perfil de ${analysis.username}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Evita loop infinito
                      e.target.src = 'https://placehold.co/150x150/e1306c/ffffff?text=@';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-instagram-purple text-white font-bold text-xl">
                    {analysis.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Análise de @{analysis.username}
                </h2>
                <p className="text-gray-600">{analysis.fullName}</p>
              </div>
            </div>
            <div className="print:hidden flex space-x-2">
              <button 
                onClick={handlePrint}
                className="text-instagram-blue hover:text-instagram-darkBlue p-2 rounded-full"
                title="Imprimir relatório"
              >
                <FaPrint />
              </button>
              <button 
                onClick={handleShare}
                className="text-instagram-blue hover:text-instagram-darkBlue p-2 rounded-full"
                title="Compartilhar relatório"
              >
                <FaShareAlt />
              </button>
              <button 
                onClick={handleDownload}
                className="text-instagram-blue hover:text-instagram-darkBlue p-2 rounded-full"
                title="Baixar dados JSON"
              >
                <FaDownload />
              </button>
            </div>
          </div>
          
          {/* Resumo do perfil */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Seguidores</p>
              <p className="text-xl font-bold">{formatLargeNumber(analysis.statsSnapshot.followers)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Seguindo</p>
              <p className="text-xl font-bold">{formatLargeNumber(analysis.statsSnapshot.following)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Publicações</p>
              <p className="text-xl font-bold">{formatLargeNumber(analysis.statsSnapshot.posts)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500 text-sm">Taxa de Engajamento</p>
              <p className="text-xl font-bold">{analysis.statsSnapshot.engagementRate}</p>
            </div>
          </div>
          
          {/* Informações do perfil */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Informações do Perfil</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Tipo de Conta</p>
                <p className="font-medium">{analysis.accountType}</p>
              </div>
              <div>
                <p className="text-gray-500">Categoria</p>
                <p className="font-medium">{analysis.contentCategories.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Frequência de Posts</p>
                <p className="font-medium">{analysis.postFrequency}</p>
              </div>
              <div>
                <p className="text-gray-500">Biografia</p>
                <p className="font-medium">{analysis.hasBio ? 'Presente' : 'Ausente'}</p>
              </div>
              <div>
                <p className="text-gray-500">Link na Bio</p>
                <p className="font-medium">{analysis.hasLink ? 'Presente' : 'Ausente'}</p>
              </div>
              <div>
                <p className="text-gray-500">Destaques</p>
                <p className="font-medium">{analysis.hasHighlights ? 'Presentes' : 'Ausentes'}</p>
              </div>
            </div>
          </div>
          
          {/* Resumo de Insights (se disponível) */}
          {analysis.insightSummary && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-700">
                <FaBrain className="mr-2" size={18} />
                Insights Personalizados
              </h3>
              <p className="text-sm text-blue-800">{analysis.insightSummary}</p>
            </div>
          )}
          
          {/* Recomendações */}
          <div>
            <div className="flex items-center mb-4">
              <FaBrain className="text-instagram-purple mr-2" size={20} />
              <h3 className="text-lg font-semibold">
                Recomendações Personalizadas
                <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                  Análise por IA
                </span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.recommendations && analysis.recommendations.length > 0 ? (
                analysis.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`bg-white border-l-4 rounded-lg shadow p-4 hover:shadow-md transition-shadow ${
                      rec.priority === 'Alta' ? 'border-red-500' :
                      rec.priority === 'Média' ? 'border-yellow-500' : 'border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-800">{rec.title}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        rec.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority || 'Média'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 text-sm">
                      {rec.description}
                    </p>
                    {rec.benefits && rec.benefits.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Benefícios:</p>
                        <ul className="text-xs text-gray-600 pl-4 list-disc">
                          {rec.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">Nenhuma recomendação disponível para este perfil.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="mt-8 pt-4 border-t text-center text-gray-500 text-xs">
            <p>Análise gerada em {new Date(analysis.analysisDate || new Date()).toLocaleDateString('pt-BR')} às {new Date(analysis.analysisDate || new Date()).toLocaleTimeString('pt-BR')}</p>
            <p>Estas recomendações são baseadas em análise automatizada e devem ser consideradas como sugestões.</p>
          </div>
          
          {/* Recomendação de Serviços */}
          <ServicesRecommendation profileData={analysis} />
          
          {/* Análise e Sugestões para Bio */}
          <BioAnalyzer profileData={analysis} />
        </motion.div>
      )}
    </div>
  );
};

export default InstagramAnalyzer;