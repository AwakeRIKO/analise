// Garantir que os dados do instagrapi sejam corretamente transformados para o formato esperado pelo frontend
const formatProfileData = (data) => {
  // Se os dados vierem do instagrapi, eles terão uma estrutura diferente
  if (data.stats && typeof data.stats === 'object') {
    // Adaptar formato do instagrapi para o formato esperado pelo frontend
    return {
      username: data.username,
      fullName: data.fullName,
      bio: data.bio,
      followersCount: data.stats.followers,
      followingCount: data.stats.following,
      postsCount: data.stats.posts,
      profilePicture: data.profilePicture,
      isVerified: data.isVerified,
      profileUrl: data.externalLink,
      engagementRate: calculateEngagementRate(data.stats.followers, data.stats.posts)
    };
  }
  
  // Formato padrão do scraping
  return {
    username: data.username,
    fullName: data.fullName,
    bio: data.bio,
    followersCount: data.stats?.followers || 0,
    followingCount: data.stats?.following || 0,
    postsCount: data.stats?.posts || 0,
    profilePicture: data.profilePicture,
    isVerified: data.isVerified,
    profileUrl: data.externalLink,
    engagementRate: calculateEngagementRate(data.stats?.followers || 0, data.stats?.posts || 0)
  };
};

// Função para calcular taxa de engajamento estimada
const calculateEngagementRate = (followers, posts) => {
  if (!followers || followers === 0) return 0.045; // Valor padrão de 4.5%
  
  // Estimativa baseada no número de seguidores
  if (followers >= 100000) return 0.015; // 1.5% para contas grandes
  if (followers >= 10000) return 0.025; // 2.5% para contas médias-grandes
  if (followers >= 1000) return 0.035; // 3.5% para contas médias
  return 0.045; // 4.5% para contas pequenas
};

export { formatProfileData, calculateEngagementRate }; 