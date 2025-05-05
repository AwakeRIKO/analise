import React, { useState } from 'react';
import { FaCheckCircle, FaWhatsapp, FaEnvelope, FaStar, FaShoppingCart, FaChartLine } from 'react-icons/fa';

const QuoteModal = ({ service, username, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">Solicitar Orçamento</h3>
          <p className="text-gray-600 text-sm">Serviço: {service.title} para @{username}</p>
        </div>
        
        <div className="p-5">
          <p className="text-gray-700 mb-4">
            Você pode entrar em contato diretamente pelo WhatsApp para obter um orçamento personalizado para este serviço.
          </p>
          
          <div className="space-y-4">
            <a 
              href={`https://api.whatsapp.com/send?phone=5516996382502&text=Ol%C3%A1%2C%20gostaria%20de%20um%20or%C3%A7amento%20para%20o%20servi%C3%A7o%20de%20${encodeURIComponent(service.title)}%20para%20o%20perfil%20%40${encodeURIComponent(username)}.`} 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md flex items-center justify-center"
            >
              <FaWhatsapp className="mr-2" size={20} />
              Contato via WhatsApp
            </a>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesRecommendation = ({ data, username }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const openQuoteModal = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  // Função para obter o ícone com base no ID
  const getIconComponent = (iconId) => {
    switch (iconId) {
      case 'FaStar':
        return <FaStar className="text-yellow-400" />;
      case 'FaChartLine':
        return <FaChartLine className="text-blue-500" />;
      case 'FaShoppingCart':
        return <FaShoppingCart className="text-purple-500" />;
      default:
        return <FaCheckCircle className="text-green-500" />;
    }
  };

  // Função para obter o título correto com base no ID
  const getServiceTitle = (service) => {
    switch (service.id) {
      case 'followers':
        return 'Seguidores';
      case 'engagement':
        return 'Engajamento';
      case 'social-media':
        return 'Gestão de Redes';
      default:
        return service.title || 'Serviço';
    }
  };

  // Todos os serviços atualmente oferecidos
  const allServices = [
    {
      id: 'followers',
      title: 'Seguidores',
      description: 'Aumente seu perfil com seguidores reais e ativos',
      icon: <FaStar className="text-yellow-400" />,
      options: [
        { id: 'followers-1500', quantity: '1.500', price: 99.99 },
        { id: 'followers-3000', quantity: '3.000', price: 189.90 },
        { id: 'followers-5000', quantity: '5.000', price: 289.90 },
        { id: 'followers-10000', quantity: '10.000', price: 569.90 }
      ]
    },
    {
      id: 'engagement',
      title: 'Engajamento',
      description: 'Aumente curtidas e comentários nas suas publicações',
      icon: <FaChartLine className="text-blue-500" />,
      options: [
        { id: 'likes-500', type: 'Curtidas', quantity: '500', price: 45.00 },
        { id: 'likes-1000', type: 'Curtidas', quantity: '1.000', price: 60.00 },
        { id: 'comments-10', type: 'Comentários', quantity: '10', price: 25.00 },
        { id: 'comments-50', type: 'Comentários', quantity: '50', price: 90.00 }
      ]
    },
    {
      id: 'social-media',
      title: 'Gestão de Redes',
      description: 'Planos completos de social media para sua marca',
      icon: <FaShoppingCart className="text-purple-500" />,
      options: [
        { id: 'social-media-basic', type: 'Plano Básico', price: 499.90 },
        { id: 'social-media-premium', type: 'Plano Premium', price: 899.90 },
        { id: 'social-media-enterprise', type: 'Plano Empresarial', price: 1299.90 }
      ]
    }
  ];

  // Obter os serviços recomendados, ou mostrar todos se não houver recomendação específica
  const recommendedServices = data?.recommendedServices || allServices;

  // Função para determinar prioridade e destacar as recomendações mais relevantes
  const getServicePriority = (serviceId) => {
    if (!data?.priorities) return 'normal';
    
    const priority = data.priorities.find(p => p.serviceId === serviceId);
    return priority?.level || 'normal';
  };

  // Função para obter a classe CSS baseada na prioridade
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-green-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      default:
        return '';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        <FaShoppingCart className="mr-2 text-pink-600" /> 
        Serviços Recomendados para @{username}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedServices.map((service) => {
          const priority = getServicePriority(service.id);
          const priorityClass = getPriorityClass(priority);
          
          return (
            <div 
              key={service.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden ${priorityClass} hover:shadow-lg transition-shadow`}
            >
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="mr-3 text-xl">
                    {typeof service.icon === 'string' ? getIconComponent(service.icon) : (service.icon || <FaCheckCircle className="text-green-500" />)}
                  </div>
                  <h4 className="font-semibold text-gray-800">{getServiceTitle(service)}</h4>
                  
                  {priority === 'high' && (
                    <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  )}
      </div>
      
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                
                {service.options && (
                  <div className="space-y-2 mb-4">
                    {service.options.slice(0, 2).map((option) => (
                      <div key={option.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          {option.type ? `${option.type} ` : ''}{option.quantity || 'Plano Completo'}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          R$ {option.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                    
                    {service.options.length > 2 && (
                      <div className="text-xs text-gray-500 italic">
                        +{service.options.length - 2} opções adicionais
                      </div>
                    )}
              </div>
                )}
                
                <div className="mt-auto">
                <button
                    onClick={() => openQuoteModal(service)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md font-medium hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center justify-center"
                >
                    <FaWhatsapp className="mr-2" />
                    Solicitar Orçamento
                </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Mensagem de Contato Direto */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-2">Prefere falar diretamente com um consultor?</p>
        <a 
          href={`https://wa.me/5516996382502?text=Olá! Gostaria de saber mais sobre os serviços para o perfil @${username || 'meu_perfil'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors"
        >
          <FaWhatsapp className="mr-2" />
          Fale Conosco no WhatsApp
        </a>
      </div>
      
      {/* Modal de Orçamento */}
      {showModal && selectedService && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transition-all transform">
            <h4 className="text-xl font-bold mb-4">Solicitar Orçamento - {getServiceTitle(selectedService)}</h4>
            
            <p className="mb-4 text-gray-700">
              Você está solicitando um orçamento para {getServiceTitle(selectedService).toLowerCase()} para o perfil <span className="font-semibold">@{username || 'seu_perfil'}</span>.
            </p>
            
            <p className="mb-6 text-gray-700">
              Clique no botão abaixo para conversar diretamente com um consultor pelo WhatsApp:
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              
              <a 
                href={`https://wa.me/5516996382502?text=Olá! Gostaria de um orçamento para ${getServiceTitle(selectedService).toLowerCase()} para o perfil @${username || 'meu_perfil'}`}
            target="_blank" 
            rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors flex items-center"
                onClick={() => setShowModal(false)}
          >
                <FaWhatsapp className="mr-2" />
                Conversar no WhatsApp
          </a>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default ServicesRecommendation; 