import { useState, useEffect } from 'react';
import { FaShoppingCart, FaAngleDown, FaAngleUp, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SERVICES = {
  followers: [
    { qty: 650, price: 54.90, label: "600 a 650 Seguidores", destacado: true, description: "ÓTIMO PARA TESTE" },
    { qty: 1300, price: 74.90, label: "1.000 a 1.300 Seguidores" },
    { qty: 2300, price: 129.90, label: "2.000 a 2.300 Seguidores" },
    { qty: 3300, price: 189.90, label: "3.000 a 3.300 Seguidores" },
    { qty: 5500, price: 289.90, label: "5.000 a 5.500 Seguidores" },
    { qty: 6500, price: 350.00, label: "6.000 a 6.500 Seguidores" },
    { qty: 10500, price: 550.00, label: "10.000 a 10.500 Seguidores" },
    { qty: 16000, price: 779.00, label: "15.000 a 16.000 Seguidores" },
    { qty: 20500, price: 979.00, label: "20.000 a 20.500 Seguidores" }
  ],
  likes: [
    { qty: 500, price: 45.00, label: "500 Curtidas" },
    { qty: 1000, price: 60.00, label: "1.000 Curtidas" }
  ],
  comments: [
    { qty: 10, price: 20.00, label: "10 Comentários" },
    { qty: 50, price: 70.00, label: "50 Comentários" },
    { qty: 100, price: 100.00, label: "100 Comentários" }
  ],
  verifiedComments: [
    { qty: 1, price: 50.00, label: "1 Comentário Verificado" }
  ],
  storyViews: [
    { qty: 1000, price: 69.90, label: "1.000 Visualizações" },
    { qty: 3000, price: 149.90, label: "3.000 Visualizações" },
    { qty: 5000, price: 299.90, label: "5.000 Visualizações" }
  ],
  videoViews: [
    { qty: 1000, price: 55.00, label: "1.000 Visualizações" }
  ],
  liveViews: [
    { qty: 100, price: 79.90, label: "100 Visualizações em Live (1h)" },
    { qty: 500, price: 139.90, label: "500 Visualizações em Live (1h)" },
    { qty: 1000, price: 229.90, label: "1.000 Visualizações em Live (1h)" }
  ]
};

const ServicesRecommendation = ({ profileData }) => {
  const [expandedCategory, setExpandedCategory] = useState('followers');
  const [recommendedServices, setRecommendedServices] = useState([]);

  useEffect(() => {
    if (!profileData) return;
    
    // Se já temos recomendações da API, usá-las
    if (profileData.serviceRecommendations && profileData.serviceRecommendations.length > 0) {
      // Converter as recomendações da API para o formato do componente
      const apiRecommendations = profileData.serviceRecommendations.map(rec => {
        // Encontrar o serviço correspondente em nossa lista de serviços
        let serviceType = 'followers';
        if (rec.service_type.includes('curtida')) serviceType = 'likes';
        else if (rec.service_type.includes('coment')) serviceType = 'comments';
        else if (rec.service_type.includes('stor')) serviceType = 'storyViews';
        else if (rec.service_type.includes('vídeo') || rec.service_type.includes('video') || rec.service_type.includes('reel')) serviceType = 'videoViews';
        
        // Encontrar o serviço específico pelo preço ou descrição
        const serviceList = SERVICES[serviceType] || [];
        const service = serviceList.find(s => 
          Math.abs(s.price - rec.price) < 1 || // Preço aproximado
          s.label.toLowerCase().includes(rec.package.toLowerCase().replace(/[^0-9a-záàâãéèêíïóôõöúçñ]/gi, ''))
        ) || serviceList[0];
        
        return {
          type: serviceType,
          service: service,
          reason: rec.reason
        };
      }).filter(rec => rec.service); // Filtrar apenas recomendações com serviço válido
      
      setRecommendedServices(apiRecommendations);
    } else {
      // Caso contrário, gerar recomendações localmente
      const recommendations = analyzeProfileForServices(profileData);
      setRecommendedServices(recommendations);
    }
  }, [profileData]);

  const analyzeProfileForServices = (profile) => {
    const recommendations = [];
    
    // Lógica para decidir quais serviços recomendar com base no perfil
    const followersCount = profile.statsSnapshot?.followers || 0;
    const postsCount = profile.statsSnapshot?.posts || 0;
    
    // Recomendação de seguidores
    if (followersCount < 1000) {
      // Perfil pequeno, recomendar pacote inicial de seguidores
      recommendations.push({
        type: 'followers',
        service: SERVICES.followers.find(s => s.qty <= 1300) || SERVICES.followers[0],
        reason: 'Aumente sua credibilidade com mais seguidores'
      });
    } else if (followersCount < 5000) {
      // Perfil médio, recomendar pacote intermediário
      recommendations.push({
        type: 'followers',
        service: SERVICES.followers.find(s => s.qty >= 3300 && s.qty <= 5500) || SERVICES.followers[3],
        reason: 'Alcance a marca de 5K seguidores para aumentar sua autoridade'
      });
    } else {
      // Perfil grande, recomendar pacote grande
      recommendations.push({
        type: 'followers',
        service: SERVICES.followers.find(s => s.qty >= 10000) || SERVICES.followers[6],
        reason: 'Dê o próximo passo para se tornar um influenciador de destaque'
      });
    }
    
    // Recomendação de curtidas e comentários
    if (postsCount > 0) {
      recommendations.push({
        type: 'likes',
        service: SERVICES.likes[0],
        reason: 'Aumente o engajamento das suas publicações'
      });
      
      recommendations.push({
        type: 'comments',
        service: SERVICES.comments[0],
        reason: 'Fortaleça a interação nos seus posts com comentários'
      });
    }
    
    // Recomendação de visualizações para contas mais ativas
    if (postsCount > 10) {
      recommendations.push({
        type: 'storyViews',
        service: SERVICES.storyViews[0],
        reason: 'Aumente o alcance dos seus stories para maior visibilidade'
      });
    }
    
    return recommendations;
  };

  const handleContactWhatsApp = (service) => {
    // Número de telefone no formato internacional (substitua pelo número correto)
    const phoneNumber = "5511999999999"; // Substitua pelo seu número real
    
    // Mensagem personalizada com base no serviço e perfil
    const message = `Olá! Vi a análise do meu perfil Instagram @${profileData.username} e gostaria de adquirir o pacote: ${service.service.label} por R$ ${service.service.price.toFixed(2)}. Poderia me dar mais informações?`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (!profileData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mt-8"
    >
      <div className="flex items-center mb-4">
        <FaShoppingCart className="text-instagram-purple mr-2" size={22} />
        <h2 className="text-xl font-bold">Serviços Recomendados para Seu Perfil</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Com base na análise do seu perfil @{profileData.username}, 
        identificamos os seguintes serviços que podem potencializar seus resultados:
      </p>
      
      <div className="space-y-4">
        {recommendedServices.map((service, index) => (
          <motion.div 
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{service.service.label}</h3>
                <p className="text-gray-600 text-sm mt-1">{service.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-instagram-purple font-bold text-xl">
                  R$ {service.service.price.toFixed(2)}
                </p>
                <button
                  onClick={() => handleContactWhatsApp(service)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded-full font-medium flex items-center text-sm hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp className="mr-1" /> Solicitar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="font-semibold mb-3">Todos os Serviços Disponíveis</h3>
        
        <div className="space-y-3">
          {Object.entries(SERVICES).map(([category, services]) => (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="flex justify-between items-center w-full p-3 text-left bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-medium capitalize">
                  {category === 'followers' && 'Seguidores Brasileiros'}
                  {category === 'likes' && 'Curtidas Brasileiras'}
                  {category === 'comments' && 'Comentários Brasileiros'}
                  {category === 'verifiedComments' && 'Comentários Verificados'}
                  {category === 'storyViews' && 'Visualizações em Stories'}
                  {category === 'videoViews' && 'Visualizações em Reels/Vídeos'}
                  {category === 'liveViews' && 'Visualizações em Lives'}
                </span>
                {expandedCategory === category ? <FaAngleUp /> : <FaAngleDown />}
              </button>
              
              {expandedCategory === category && (
                <div className="p-3 space-y-2">
                  {services.map((service, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span className={`${service.destacado ? 'font-medium text-instagram-purple' : ''}`}>
                        {service.label} {service.description && <span className="text-xs ml-1 text-green-600">({service.description})</span>}
                      </span>
                      <div className="flex items-center">
                        <span className="font-medium mr-3">R$ {service.price.toFixed(2)}</span>
                        <button
                          onClick={() => handleContactWhatsApp({ service })}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          <FaWhatsapp />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
        <h4 className="font-medium text-blue-800 mb-1">Importante</h4>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Você não precisa informar sua senha, apenas seu @ no Instagram</li>
          <li>Prazo para inicialização: 1h-4h até 24h, 42h ou 72h para finalização</li>
          <li>Velocidade de envio: 1.000 a 2.000 seguidores por dia</li>
          <li>Formas de pagamento: Pix, Depósito, Transferência Bancária, Cartão de crédito e mais</li>
        </ul>
        
        <div className="mt-4 flex justify-center">
          <a 
            href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços%20para%20Instagram." 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <FaWhatsapp className="mr-2" size={18} />
            Fale conosco no WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ServicesRecommendation; 