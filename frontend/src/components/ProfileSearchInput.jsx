import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaInstagram, FaSearch } from 'react-icons/fa'

const ProfileSearchInput = ({ onSearch }) => {
  const [username, setUsername] = useState('')
  const [isValid, setIsValid] = useState(true)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validação simples - remover @ se usuário incluiu
    let cleanUsername = username.trim()
    if (cleanUsername.startsWith('@')) {
      cleanUsername = cleanUsername.substring(1)
    }
    
    // Verificar se está vazio
    if (!cleanUsername) {
      setIsValid(false)
      return
    }
    
    setIsValid(true)
    onSearch(cleanUsername)
  }
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6 md:p-8 border border-gray-100"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="section-title mb-6">
        <FaInstagram className="text-primary mr-3" size={24} />
        Análise de Perfil Instagram
      </h2>
      
      <p className="text-gray-600 mb-6">
        Insira o nome de usuário do Instagram para obter uma análise completa com
        recomendações personalizadas e insights estratégicos para crescimento.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-primary font-medium">@</span>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nome_de_usuario"
            className={`input pl-8 ${!isValid ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {!isValid && (
            <p className="mt-1 text-red-500 text-sm">
              Por favor, insira um nome de usuário válido
            </p>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full flex items-center justify-center"
        >
          <FaSearch className="mr-2" />
          Analisar Perfil
        </button>
      </form>
      
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Receba resultados baseados em inteligência artificial e anos de experiência em marketing digital
        </p>
      </div>
    </motion.div>
  )
}

export default ProfileSearchInput 