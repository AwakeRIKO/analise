import React from 'react';
import { FaRocket, FaTrophy, FaChartLine, FaUnlock, FaHandshake, FaRegLightbulb, FaLightbulb } from 'react-icons/fa';

const StrategicRecommendations = ({ recommendations }) => {
  // Verificar se temos recomendações
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Função para determinar o ícone baseado no título ou categoria
  const getRecommendationIcon = (recommendation) => {
    const title = getProperty(recommendation, ['título', 'title'])?.toLowerCase() || '';
    const category = recommendation.category?.toLowerCase() || '';
    
    if (title.includes('parceria') || title.includes('marca') || category.includes('parceria')) {
      return <FaHandshake className="text-blue-500" size={20} />;
    }
    if (title.includes('live') || title.includes('transmissões') || title.includes('transmissao')) {
      return <FaRocket className="text-purple-500" size={20} />;
    }
    if (title.includes('hashtag') || title.includes('publicações')) {
      return <FaChartLine className="text-yellow-500" size={20} />;
    }
    if (title.includes('conteúdo') || title.includes('conteudo') || title.includes('educat')) {
      return <FaRegLightbulb className="text-green-500" size={20} />;
    }
    if (title.includes('anúncio') || title.includes('anuncio') || title.includes('pago')) {
      return <FaTrophy className="text-indigo-500" size={20} />;
    }
    if (title.includes('bio') || title.includes('perfil')) {
      return <FaLightbulb className="text-amber-500" size={20} />;
    }
    
    // Ícone padrão
    return <FaRocket className="text-pink-500" size={20} />;
  };

  // Função para compatibilidade com diferentes formatos de propriedades
  const getProperty = (recommendation, propertyNames) => {
    for (const name of propertyNames) {
      if (recommendation[name] !== undefined) {
        return recommendation[name];
      }
    }
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
        <FaRocket className="mr-2 text-pink-600" /> 
        Recomendações Estratégicas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((recommendation, index) => {
          // Obter valores compatíveis com diferentes formatos
          const title = getProperty(recommendation, ['título', 'title']);
          const description = getProperty(recommendation, ['descrição', 'description']);
          const implementation = getProperty(recommendation, ['implementação', 'implementation', 'implementacao']);
          const impact = getProperty(recommendation, ['impacto', 'impact']);
          
          return (
            <div 
              key={index} 
              className="rounded-lg border border-pink-100 bg-pink-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getRecommendationIcon(recommendation)}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-2">{title}</h4>
                    <p className="text-gray-700 text-sm mb-3">{description}</p>
                  </div>
                </div>
                
                {/* Exibir implementação e impacto em áreas destacadas */}
                {implementation && (
                  <div className="mt-4 mb-2">
                    <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded">
                      <p className="text-sm font-medium text-blue-700 mb-1">Como implementar:</p>
                      <p className="text-sm text-gray-700">{implementation}</p>
                    </div>
                  </div>
                )}
                
                {impact && (
                  <div className="mt-2">
                    <div className="bg-green-50 border-l-4 border-green-300 p-3 rounded">
                      <p className="text-sm font-medium text-green-700 mb-1">Impacto esperado:</p>
                      <p className="text-sm text-gray-700">{impact}</p>
                    </div>
                  </div>
                )}
                
                {/* Manter compatibilidade com o formato anterior que usa steps */}
                {recommendation.steps && recommendation.steps.length > 0 && (
                  <div className="mt-3 bg-blue-50 border-l-4 border-blue-300 p-3 rounded">
                    <p className="text-sm font-medium text-blue-700 mb-1">Como implementar:</p>
                    <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
                      {recommendation.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Estas recomendações são geradas especificamente para o seu perfil
          pela nossa inteligência artificial especializada em marketing digital.
        </p>
      </div>
    </div>
  );
};

export default StrategicRecommendations; 