import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaHeart, FaComment, FaEye, FaVideo, FaPlay, FaChartLine } from 'react-icons/fa'

const ServicesSection = ({ services, selectedServices, onSelectService }) => {
  const [activeTab, setActiveTab] = useState('followers')
  
  const tabs = [
    { id: 'followers', label: 'Seguidores', icon: <FaUsers /> },
    { id: 'likes', label: 'Curtidas', icon: <FaHeart /> },
    { id: 'comments', label: 'Comentários', icon: <FaComment /> },
    { id: 'videoViews', label: 'Views Vídeos', icon: <FaVideo /> },
    { id: 'storyViews', label: 'Views Stories', icon: <FaEye /> },
    { id: 'other', label: 'Outros', icon: <FaChartLine /> }
  ]
  
  const renderServiceCards = () => {
    if (activeTab === 'followers') {
      return services.followers.map((service, index) => (
        <ServiceCard 
          key={index}
          id={index}
          type="followers"
          label="Seguidores"
          qty={service.qty}
          price={service.price}
          isSelected={selectedServices.some(s => s.id === index && s.type === 'followers')}
          onSelect={() => onSelectService({ id: index, type: 'followers', qty: service.qty, price: service.price })}
          icon={<FaUsers size={24} className="text-instagram-purple" />}
        />
      ))
    }
    
    if (activeTab === 'likes') {
      return services.likes.map((service, index) => (
        <ServiceCard 
          key={index}
          id={index}
          type="likes"
          label="Curtidas"
          qty={service.qty}
          price={service.price}
          isSelected={selectedServices.some(s => s.id === index && s.type === 'likes')}
          onSelect={() => onSelectService({ id: index, type: 'likes', qty: service.qty, price: service.price })}
          icon={<FaHeart size={24} className="text-instagram-pink" />}
        />
      ))
    }
    
    if (activeTab === 'comments') {
      return services.comments.map((service, index) => (
        <ServiceCard 
          key={index}
          id={index}
          type="comments"
          label="Comentários"
          qty={service.qty}
          price={service.price}
          isSelected={selectedServices.some(s => s.id === index && s.type === 'comments')}
          onSelect={() => onSelectService({ id: index, type: 'comments', qty: service.qty, price: service.price })}
          icon={<FaComment size={24} className="text-instagram-blue" />}
        />
      ))
    }
    
    if (activeTab === 'videoViews') {
      return services.videoViews.map((service, index) => (
        <ServiceCard 
          key={index}
          id={index}
          type="videoViews"
          label="Visualizações de Vídeo"
          qty={service.qty}
          price={service.price}
          isSelected={selectedServices.some(s => s.id === index && s.type === 'videoViews')}
          onSelect={() => onSelectService({ id: index, type: 'videoViews', qty: service.qty, price: service.price })}
          icon={<FaVideo size={24} className="text-instagram-yellow" />}
        />
      ))
    }
    
    if (activeTab === 'storyViews') {
      return services.storyViews.map((service, index) => (
        <ServiceCard 
          key={index}
          id={index}
          type="storyViews"
          label="Visualizações de Stories"
          qty={service.qty}
          price={service.price}
          isSelected={selectedServices.some(s => s.id === index && s.type === 'storyViews')}
          onSelect={() => onSelectService({ id: index, type: 'storyViews', qty: service.qty, price: service.price })}
          icon={<FaEye size={24} className="text-gray-500" />}
        />
      ))
    }
    
    if (activeTab === 'other') {
      const otherServices = [
        ...services.liveViews.map((service, index) => ({
          id: index,
          type: 'liveViews',
          label: `Visualizações de Live (${service.duration})`,
          qty: service.qty,
          price: service.price,
          icon: <FaPlay size={24} className="text-red-500" />
        })),
        {
          id: 0,
          type: 'paidTraffic',
          label: services.paidTraffic.service,
          service: services.paidTraffic.service,
          price: services.paidTraffic.price,
          icon: <FaChartLine size={24} className="text-green-500" />
        },
        {
          id: 0,
          type: 'socialMedia',
          label: services.socialMedia.service,
          service: services.socialMedia.service,
          price: services.socialMedia.startingPrice,
          icon: <FaChartLine size={24} className="text-blue-500" />
        }
      ]
      
      return otherServices.map((service, index) => (
        <ServiceCard 
          key={`${service.type}-${index}`}
          id={service.id}
          type={service.type}
          label={service.label}
          qty={service.qty}
          service={service.service}
          price={service.price}
          isSelected={selectedServices.some(s => s.id === service.id && s.type === service.type)}
          onSelect={() => onSelectService({
            id: service.id,
            type: service.type,
            qty: service.qty,
            service: service.service,
            price: service.price
          })}
          icon={service.icon}
        />
      ))
    }
    
    return null
  }
  
  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-6">Escolha os serviços desejados</h3>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium ${
              activeTab === tab.id 
                ? 'bg-instagram-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderServiceCards()}
      </div>
    </motion.div>
  )
}

const ServiceCard = ({ 
  label, 
  qty, 
  price, 
  service,
  icon,
  isSelected,
  onSelect 
}) => {
  return (
    <motion.div
      className={`p-4 rounded-lg border-2 cursor-pointer ${
        isSelected ? 'border-instagram-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div className="flex items-center mb-3">
        <div className="mr-3">
          {icon}
        </div>
        <h4 className="font-semibold">{label}</h4>
      </div>
      
      {qty && (
        <p className="text-lg font-bold mb-1">
          {qty.toLocaleString()} {label}
        </p>
      )}
      
      {service && (
        <p className="text-lg font-bold mb-1">
          {service}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-lg font-bold text-instagram-blue">
          R$ {price.toFixed(2)}
        </p>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-instagram-blue bg-instagram-blue' : 'border-gray-300'
        }`}>
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ServicesSection 