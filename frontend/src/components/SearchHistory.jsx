import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaUser, FaSyncAlt } from 'react-icons/fa';
import axios from 'axios';

const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  // Função para buscar histórico
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (filter) {
        params.username = filter;
      }
      
      const response = await axios.get('/api/search-history', { params });
      setHistory(response.data);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      setError('Não foi possível carregar o histórico de pesquisas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar histórico ao montar componente
  useEffect(() => {
    fetchHistory();
  }, []);

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  // Função para formatar números grandes
  const formatNumber = (num) => {
    // Para valores realmente grandes (acima de 1 milhão), podemos usar abreviação
    if (num >= 1000000) {
      return new Intl.NumberFormat('pt-BR', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
      }).format(num);
    }
    
    // Para valores menores, exibir o número completo com separadores
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Função para lidar com filtro
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaHistory className="mr-2 text-primary" />
        Histórico de Pesquisas
      </h2>
      
      {/* Filtro de pesquisa */}
      <form onSubmit={handleFilterSubmit} className="mb-4 flex">
        <div className="relative flex-grow mr-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por username"
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <FaSearch className="mr-2" /> Filtrar
        </button>
        <button type="button" onClick={fetchHistory} className="btn btn-secondary ml-2">
          <FaSyncAlt className={loading ? 'animate-spin' : ''} />
        </button>
      </form>
      
      {/* Exibir erro, se houver */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Status de carregamento */}
      {loading && (
        <div className="text-center py-4">
          <FaSyncAlt className="animate-spin mx-auto text-2xl text-primary mb-2" />
          <p>Carregando histórico...</p>
        </div>
      )}
      
      {/* Tabela de histórico */}
      {!loading && history.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Nenhum histórico de pesquisa encontrado.
        </div>
      )}
      
      {!loading && history.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">Data</th>
                <th className="py-2 px-3 text-left">Username</th>
                <th className="py-2 px-3 text-left">Nome</th>
                <th className="py-2 px-3 text-right">Posts</th>
                <th className="py-2 px-3 text-right">Seguidores</th>
                <th className="py-2 px-3 text-right">Seguindo</th>
                <th className="py-2 px-3 text-right">Engajamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3">{formatDate(item.search_timestamp)}</td>
                  <td className="py-2 px-3 font-medium">@{item.username}</td>
                  <td className="py-2 px-3">{item.full_name}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(item.posts)}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(item.followers)}</td>
                  <td className="py-2 px-3 text-right">{formatNumber(item.following)}</td>
                  <td className="py-2 px-3 text-right">{(item.engagement_rate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchHistory; 