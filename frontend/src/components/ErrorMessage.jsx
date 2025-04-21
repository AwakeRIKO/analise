import { motion } from 'framer-motion'
import { FaExclamationTriangle } from 'react-icons/fa'

const ErrorMessage = ({ message }) => {
  return (
    <motion.div
      className="card p-6 border-l-4 border-red-500 bg-red-50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="text-red-500" size={24} />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">
            Erro ao buscar perfil
          </h3>
          <div className="mt-2 text-red-700">
            <p>{message}</p>
          </div>
          <div className="mt-4">
            <ul className="list-disc list-inside text-sm text-red-700">
              <li>Verifique se o nome de usuário está correto</li>
              <li>Certifique-se de que a conta não é privada ou está bloqueada</li>
              <li>Tente novamente mais tarde</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ErrorMessage 