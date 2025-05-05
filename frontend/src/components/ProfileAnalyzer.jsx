import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfileAnalyzer() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState('openai'); // Padrão: OpenAI

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Por favor, insira um nome de usuário válido');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Incluir o modelo selecionado como parâmetro de consulta
      const response = await axios.get(`/api/profile/${username}?model=${selectedModel}`);
      setResult(response.data);
    } catch (err) {
      console.error('Erro ao analisar perfil:', err);
      setError(err.response?.data?.error || 'Erro ao analisar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar modelo de IA
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Analisador de Perfil do Instagram</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-grow">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@nome_de_usuario"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <div className="w-full md:w-auto">
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
              disabled={loading}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
            
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Analisando...' : 'Analisar Perfil'}
            </button>
          </div>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div>
          {/* Exibir qual modelo de IA foi usado */}
          {result.modelUsed && (
            <div className="mb-4 bg-gray-100 p-3 rounded-lg inline-block">
              <span className="font-semibold">Modelo usado: </span>
              <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                {result.modelUsed === 'openai' ? 'OpenAI' : 
                 result.modelUsed === 'gemini' ? 'Google Gemini' : 'Local (Exemplo)'}
              </span>
            </div>
          )}
          
          {/* Resto do componente para exibir os resultados */}
          {/* ... existing code ... */}
        </div>
      )}
    </div>
  );
}

export default ProfileAnalyzer; 