import React from 'react';
import { FaUser, FaPen, FaCamera, FaHeart } from 'react-icons/fa';

const ProfileStats = ({ profile }) => {
  // Função para processar URLs de imagens do Instagram
  const processImageUrl = (url) => {
    if (!url) return '/images/profile-placeholder.svg';
    
    // Verificar se é uma URL do Instagram
    if (url.includes('instagram') && url.includes('fbcdn.net')) {
      try {
        // Usar a nova rota de proxy do backend que salva a imagem localmente
        return `/api/profile-image/${profile.username}?url=${encodeURIComponent(url)}`;
      } catch (error) {
        console.error("Erro ao processar URL da imagem:", error);
        return '/images/profile-placeholder.svg';
      }
    }
    
    return url || '/images/profile-placeholder.svg';
  };

  // Função para tratar erros de carregamento de imagem
  const handleImageError = (e) => {
    console.error("Erro ao carregar imagem do perfil em Stats:", e);
    e.target.onerror = null;
    e.target.src = '/images/profile-placeholder.svg';
    e.target.classList.add('img-error');
  };

  // Função para formatar grandes números
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    
    if (num >= 10000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cabeçalho com foto e informações básicas */}
      <div className="flex items-center p-4 border-b">
        <div className="relative">
          <img 
            src={processImageUrl(profile.profilePicture)} 
            alt={`Perfil de ${profile.username}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-pink-500"
            onError={handleImageError}
            crossOrigin="anonymous"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
            <FaCamera />
          </div>
        </div>
        
        <div className="ml-4">
          <h3 className="text-xl font-bold text-gray-800">@{profile.username}</h3>
          <p className="text-gray-600">{profile.fullName}</p>
          
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <FaPen className="mr-1" />
            <span>
              {profile.hasBio ? 'Biografia completa' : 'Sem biografia'}
            </span>
          </div>
        </div>
      </div>

      {/* Estatísticas do perfil */}
      <div className="grid grid-cols-3 text-center py-3 border-b">
        <div className="flex flex-col p-2">
          <span className="text-lg font-bold text-gray-800">{formatNumber(profile.statsSnapshot?.posts || profile.postsCount || 0)}</span>
          <span className="text-xs text-gray-500">Publicações</span>
        </div>
        <div className="flex flex-col p-2 border-x">
          <span className="text-lg font-bold text-gray-800">{formatNumber(profile.statsSnapshot?.followers || profile.followersCount || 0)}</span>
          <span className="text-xs text-gray-500">Seguidores</span>
        </div>
        <div className="flex flex-col p-2">
          <span className="text-lg font-bold text-gray-800">{formatNumber(profile.statsSnapshot?.following || profile.followingCount || 0)}</span>
          <span className="text-xs text-gray-500">Seguindo</span>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-gray-700">Taxa de Engajamento</h4>
            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded">
              {profile.engagementRate ? `${(profile.engagementRate * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min((profile.engagementRate || 0.01) * 100 * 20, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Baseado em curtidas e comentários recentes
          </p>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <div className="font-medium">Tipo de Conta:</div>
            <div>{profile.isVerified ? 'Verificada' : (profile.accountType || 'Regular')}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">Frequência de Posts:</div>
            <div>{profile.postFrequency || 'Desconhecida'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats; 