import { motion } from 'framer-motion'
import { FaSpinner, FaInstagram } from 'react-icons/fa'

const LoadingScreen = () => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-8 md:p-12 flex flex-col items-center justify-center max-w-2xl mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mb-6">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary rounded-full opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <FaInstagram className="text-primary relative z-10" size={48} />
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold text-primary-dark mb-3">
        Analisando perfil...
      </h2>
      
      <div className="w-full max-w-md bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Estamos coletando dados, calculando métricas de engajamento e gerando recomendações personalizadas
      </p>
      
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {["Dados do perfil", "Análise de engajamento", "Recomendações"].map((step, index) => (
          <motion.div 
            key={index}
            className="bg-divulga-light rounded p-3 text-xs text-primary-dark flex flex-col items-center"
            animate={{ y: [0, -5, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              delay: index * 0.5, 
              ease: "easeInOut" 
            }}
          >
            <FaSpinner className="animate-spin mb-2 text-primary" />
            {step}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default LoadingScreen 