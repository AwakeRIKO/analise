import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <motion.div
      className="card p-6 flex flex-col items-center justify-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-16 h-16 border-t-4 border-instagram-purple border-solid rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.p 
        className="mt-4 text-lg text-gray-700 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Analisando perfil...
      </motion.p>
      <motion.p 
        className="mt-2 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Estamos coletando os dados e calculando métricas de engajamento
      </motion.p>
    </motion.div>
  )
}

export default LoadingScreen 