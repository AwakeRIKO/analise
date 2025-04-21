import { useState } from 'react'
import { motion } from 'framer-motion'
import ProfileSearchInput from './components/ProfileSearchInput'
import InstagramAnalyzer from './components/InstagramAnalyzer'
import LoadingScreen from './components/LoadingScreen'
import ErrorMessage from './components/ErrorMessage'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [usernameToAnalyze, setUsernameToAnalyze] = useState('')

  const handleSearch = async (username) => {
    setLoading(true)
    setError(null)
    
    try {
      // Verificar se o perfil existe
      const profileResponse = await fetch(`/api/profile/${username}`)
      if (!profileResponse.ok) {
        throw new Error(profileResponse.status === 404 
          ? 'Perfil não encontrado' 
          : 'Erro ao buscar dados do perfil')
      }
      
      // Se o perfil existir, guardar o username e mostrar o componente de análise
      setUsernameToAnalyze(username)
      setShowAnalyzer(true)
      
    } catch (error) {
      console.error('Erro:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container-custom">
          <h1 className="text-2xl font-bold text-instagram-purple">Analisador de Perfil Instagram</h1>
        </div>
      </header>
      
      <main className="container-custom py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!showAnalyzer && (
            <ProfileSearchInput onSearch={handleSearch} />
          )}
          
          {loading && <LoadingScreen />}
          
          {error && <ErrorMessage message={error} />}
          
          {showAnalyzer && !loading && !error && (
            <InstagramAnalyzer initialUsername={usernameToAnalyze} />
          )}
        </motion.div>
      </main>
      
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container-custom text-center text-gray-600">
          <p>© {new Date().getFullYear()} Analisador de Perfil Instagram</p>
        </div>
      </footer>
    </div>
  )
}

export default App 