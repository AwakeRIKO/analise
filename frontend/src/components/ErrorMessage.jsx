import { motion } from 'framer-motion'
import { FaExclamationTriangle } from 'react-icons/fa'

const ErrorMessage = ({ message }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 mb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <FaExclamationTriangle className="text-red-500" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Erro ao buscar perfil
          </h3>
          <p className="text-red-600 mb-4">
            {message}
          </p>
          <div className="bg-red-50 p-4 rounded">
            <h4 className="font-medium text-red-800 mb-2">Verifique:</h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              <li>Se o nome de usuário está correto</li>
              <li>Se a conta existe e não está privada</li>
              <li>Se a conexão com a internet está estável</li>
              <li>Tente novamente em alguns instantes</li>
            </ul>
          </div>
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="btn bg-white text-red-600 border border-red-300 hover:bg-red-50"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ErrorMessage 