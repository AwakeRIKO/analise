import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaLightbulb, FaBrain } from 'react-icons/fa';

const BioAnalyzer = ({ data }) => {
  // Verificar se temos dados válidos para trabalhar
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
        <div className="flex items-start">
          <FaExclamationCircle className="text-yellow-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Análise de Bio Indisponível</h3>
            <p className="text-yellow-600">
              Não foi possível analisar a biografia deste perfil. Verifique se o perfil possui uma biografia.
            </p>
          </div>
        </div>
      </div>
    );
    }
    
  // Função para determinar o ícone e cor baseado no status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return <FaCheckCircle className="text-green-500" />;
      case 'good':
        return <FaCheckCircle className="text-blue-500" />;
      case 'ok':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'poor':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };
  
  // Função para determinar a cor de borda baseada no status
  const getBorderColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'border-green-200';
      case 'good':
        return 'border-blue-200';
      case 'ok':
        return 'border-yellow-200';
      case 'poor':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };
  
  // Gerar a classificação geral
  const getOverallRating = () => {
    const score = data.score || 50;
    if (score >= 80) return { text: "Excelente", color: "text-green-600", bg: "bg-green-50", status: "excellent" };
    if (score >= 65) return { text: "Boa", color: "text-blue-600", bg: "bg-blue-50", status: "good" };
    if (score >= 50) return { text: "Adequada", color: "text-yellow-600", bg: "bg-yellow-50", status: "ok" };
    return { text: "Precisa melhorar", color: "text-red-600", bg: "bg-red-50", status: "poor" };
  };

  const overallRating = getOverallRating();

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <FaBrain className="mr-2 text-indigo-600" /> Análise da Biografia
      </h3>

      {/* Avaliação Geral */}
      <div className={`${overallRating.bg} border border-t-4 ${overallRating.status === 'excellent' ? 'border-green-400' : overallRating.status === 'good' ? 'border-blue-400' : overallRating.status === 'ok' ? 'border-yellow-400' : 'border-red-400'} rounded-lg p-4 mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-2 md:mb-0">
            {getStatusIcon(overallRating.status)}
            <h4 className={`font-semibold ${overallRating.color} ml-2`}>
              Avaliação da Bio: {overallRating.text}
            </h4>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-600 mr-2">Pontuação:</div>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                <div 
                  className={`h-2.5 rounded-full ${overallRating.status === 'excellent' ? 'bg-green-500' : overallRating.status === 'good' ? 'bg-blue-500' : overallRating.status === 'ok' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${data.score || 50}%` }}
                ></div>
            </div>
              <span className="text-sm font-medium text-gray-700">{data.score || 50}/100</span>
            </div>
          </div>
        </div>
        
        {data.summary && (
          <p className="mt-2 text-gray-700">{data.summary}</p>
        )}
          </div>
          
      {/* Critérios de Análise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {data.criteria && data.criteria.map((criterion, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 ${getBorderColor(criterion.status)}`}
          >
            <div className="flex items-center mb-2">
              {getStatusIcon(criterion.status)}
              <h4 className="font-medium text-gray-800 ml-2">{criterion.name}</h4>
            </div>
            <p className="text-gray-600 text-sm">{criterion.description}</p>
          </div>
        ))}
      </div>

      {/* Dicas de Melhoria */}
      {data.improvements && data.improvements.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-2">
          <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
            <FaLightbulb className="text-indigo-500 mr-2" /> 
            Dicas para Melhorar sua Bio
          </h4>
          
          <ul className="space-y-2">
            {data.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span className="text-indigo-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-2">
        Esta análise é realizada por IA e deve ser considerada como sugestão. 
        O impacto real pode variar dependendo do seu nicho e audiência.
      </p>
    </div>
  );
};

export default BioAnalyzer; 