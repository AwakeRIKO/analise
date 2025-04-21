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
      className="card p-6 mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaInstagram className="text-instagram-purple mr-2" size={24} />
        Buscar perfil do Instagram
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">@</span>
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
          className="btn btn-primary flex items-center justify-center"
        >
          <FaSearch className="mr-2" />
          Analisar
        </button>
      </form>
      
      <p className="mt-4 text-sm text-gray-500">
        Digite o nome de usuário do Instagram para análise (com ou sem @)
      </p>
    </motion.div>
  )
}

export default ProfileSearchInput 