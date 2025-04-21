import { FaUser, FaImage, FaUsers, FaChartLine, FaBrain, FaSync } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useState } from 'react'

const ProfileInfo = ({ profile }) => {
  const [isReloading, setIsReloading] = useState(false)

  const handleReload = () => {
    setIsReloading(true)
    window.location.reload()
  }

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <img 
            src={profile.profilePicture || 'https://via.placeholder.com/150'} 
            alt={`Foto de perfil de ${profile.username}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-instagram-purple"
          />
        </div>
        
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            {profile.fullName || profile.username}
            <span className="ml-2 text-gray-500 font-normal text-base">@{profile.username}</span>
          </h2>
          
          <p className="text-gray-700 mb-4">{profile.bio || 'Sem biografia disponível'}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="p-2 bg-instagram-lightGray rounded-full mr-3">
                <FaUsers className="text-instagram-purple" size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Seguidores</p>
                <p className="font-semibold">{profile.followersCount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 bg-instagram-lightGray rounded-full mr-3">
                <FaImage className="text-instagram-purple" size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Publicações</p>
                <p className="font-semibold">{profile.postsCount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 bg-instagram-lightGray rounded-full mr-3">
                <FaChartLine className="text-instagram-purple" size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taxa de Engajamento</p>
                <p className="font-semibold">{(profile.engagementRate * 100).toFixed(2)}%</p>
                <p className="text-xs text-gray-400">(Estimativa limitada)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Análise de Engajamento</h3>
        <p className="text-gray-700">
          {profile.engagementRate === 0 
            ? 'Não foi possível calcular a taxa de engajamento real (requer dados de posts). Análise da IA abaixo pode oferecer sugestões.'
            : profile.engagementRate < 0.01 
              ? 'Engajamento baixo. Recomendamos aumentar a interação com seguidores.' 
              : profile.engagementRate < 0.03
                ? 'Engajamento médio. Há potencial para melhorias e crescimento.'
                : 'Bom engajamento! Continue com o ótimo trabalho.'}
        </p>
      </div>
      
      {/* NOVA SEÇÃO: Análise e Sugestões */}
      {profile.aiAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold flex items-center">
              <FaBrain className="text-instagram-purple mr-2" size={20} />
              Análise e Sugestões de Otimização
            </h3>
            <button 
              className="text-gray-500 hover:text-instagram-blue flex items-center text-sm"
              onClick={handleReload}
              disabled={isReloading}
            >
              <FaSync className={`mr-1 ${isReloading ? 'animate-spin' : ''}`} />
              {isReloading ? 'Recarregando...' : 'Recarregar análise'}
            </button>
          </div>
          <div className="text-gray-700 whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
            {profile.aiAnalysis}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Nota: Análise gerada com base nos dados coletados do perfil.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default ProfileInfo 