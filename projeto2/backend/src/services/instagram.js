import puppeteer from 'puppeteer';
import accountManager from './accountManager.js';

/**
 * Busca os dados do perfil do Instagram
 * @param {string} username - Nome de usuário do Instagram
 * @returns {Promise<Object|null>} - Dados do perfil ou null se não encontrado
 */
export async function fetchProfileData(username) {
  console.log(`Buscando perfil para: ${username}`);
  
  try {
    // Usar dados simulados para desenvolvimento
    console.log(`Usando dados MOCK para: ${username}`);
    
    // Dados de exemplo para teste
    const mockProfile = {
      username: username,
      fullName: username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      bio: "Developer & Digital Creator | Compartilhando conhecimento sobre tecnologia e desenvolvimento",
      stats: {
        posts: 128,
        followers: 2345,
        following: 876
      },
      isVerified: false,
      externalLink: "https://example.com",
      profilePicture: "https://placehold.co/150",
      hasCustomProfilePicture: true,
      category: "Technology",
      isPrivate: false,
        timestamp: new Date().toISOString()
      };

    console.log(`Dados MOCK gerados com sucesso para: ${username}`);
    return mockProfile;
  } catch (error) {
    console.error(`Erro ao buscar perfil ${username}:`, error);
    throw error;
  }
}

/**
 * Analisa um perfil do Instagram e retorna recomendações
 * @param {Object} profileData - Dados do perfil
 * @returns {Object} - Análise do perfil com recomendações
 */
export async function analyzeInstagramProfile(profileData) {
  // Inicializa a análise
  const analysis = {
    profileScore: 0,
    engagementRate: 0,
    profileStrengths: [],
    improvementAreas: [],
    recommendations: [],
    insights: {
      followers: { value: profileData.stats.followers, rating: 0, comment: '' },
      following: { value: profileData.stats.following, rating: 0, comment: '' },
      posts: { value: profileData.stats.posts, rating: 0, comment: '' },
      bio: { rating: 0, comment: '' },
      profilePicture: { rating: 0, comment: '' },
      verification: { value: profileData.isVerified, rating: 0, comment: '' }
    }
  };

  // Calcular pontuação para seguidores
  if (profileData.stats.followers >= 10000) {
    analysis.insights.followers.rating = 5;
    analysis.insights.followers.comment = 'Excelente base de seguidores';
    analysis.profileStrengths.push('Base de seguidores significativa');
  } else if (profileData.stats.followers >= 5000) {
    analysis.insights.followers.rating = 4;
    analysis.insights.followers.comment = 'Boa base de seguidores';
    analysis.profileStrengths.push('Base de seguidores sólida');
  } else if (profileData.stats.followers >= 1000) {
    analysis.insights.followers.rating = 3;
    analysis.insights.followers.comment = 'Base de seguidores razoável';
  } else if (profileData.stats.followers >= 500) {
    analysis.insights.followers.rating = 2;
    analysis.insights.followers.comment = 'Base de seguidores em crescimento';
    analysis.improvementAreas.push('Aumentar base de seguidores');
    analysis.recommendations.push('Poste com mais frequência para aumentar visibilidade');
  } else {
    analysis.insights.followers.rating = 1;
    analysis.insights.followers.comment = 'Base de seguidores pequena';
    analysis.improvementAreas.push('Aumentar consideravelmente a base de seguidores');
    analysis.recommendations.push('Use hashtags relevantes para aumentar a descoberta do perfil');
  }

  // Calcular pontuação para publicações
  if (profileData.stats.posts >= 100) {
    analysis.insights.posts.rating = 5;
    analysis.insights.posts.comment = 'Ótima quantidade de conteúdo';
    analysis.profileStrengths.push('Perfil rico em conteúdo');
  } else if (profileData.stats.posts >= 50) {
    analysis.insights.posts.rating = 4;
    analysis.insights.posts.comment = 'Boa quantidade de conteúdo';
    analysis.profileStrengths.push('Conteúdo consistente');
  } else if (profileData.stats.posts >= 20) {
    analysis.insights.posts.rating = 3;
    analysis.insights.posts.comment = 'Quantidade razoável de conteúdo';
  } else if (profileData.stats.posts >= 10) {
    analysis.insights.posts.rating = 2;
    analysis.insights.posts.comment = 'Poderia ter mais conteúdo';
    analysis.improvementAreas.push('Aumentar frequência de publicações');
    analysis.recommendations.push('Crie um calendário de conteúdo para postagens regulares');
  } else {
    analysis.insights.posts.rating = 1;
    analysis.insights.posts.comment = 'Poucas publicações';
    analysis.improvementAreas.push('Perfil com pouco conteúdo');
    analysis.recommendations.push('Publique regularmente para aumentar engajamento e visibilidade');
  }

  // Análise da relação seguindo/seguidores
  const followRatio = profileData.stats.followers > 0 ? 
    profileData.stats.following / profileData.stats.followers : 0;
  
  if (followRatio > 2) {
    analysis.insights.following.rating = 2;
    analysis.insights.following.comment = 'Seguindo muitos usuários em relação aos seguidores';
    analysis.improvementAreas.push('Balanço de seguindo/seguidores');
    analysis.recommendations.push('Considere reduzir o número de contas que você segue para melhorar a percepção do perfil');
  } else if (followRatio < 0.2) {
    analysis.insights.following.rating = 4;
    analysis.insights.following.comment = 'Perfil com boa autoridade (segue poucos em relação aos seguidores)';
    analysis.profileStrengths.push('Boa proporção de seguindo/seguidores');
  } else {
    analysis.insights.following.rating = 3;
    analysis.insights.following.comment = 'Relação equilibrada entre seguindo e seguidores';
  }

  // Análise da bio
  if (profileData.bio && profileData.bio.length > 10) {
    analysis.insights.bio.rating = 4;
    analysis.insights.bio.comment = 'Bio informativa e completa';
    analysis.profileStrengths.push('Descrição de perfil bem elaborada');
  } else if (profileData.bio && profileData.bio.length > 0) {
    analysis.insights.bio.rating = 3;
    analysis.insights.bio.comment = 'Bio básica presente';
    analysis.recommendations.push('Melhore sua bio com mais informações e uma chamada para ação clara');
  } else {
    analysis.insights.bio.rating = 1;
    analysis.insights.bio.comment = 'Bio ausente ou muito curta';
    analysis.improvementAreas.push('Falta informação na bio');
    analysis.recommendations.push('Adicione uma bio informativa que descreva quem você é e o que faz');
  }

  // Análise da foto de perfil
  if (profileData.hasCustomProfilePicture) {
    analysis.insights.profilePicture.rating = 4;
    analysis.insights.profilePicture.comment = 'Foto de perfil personalizada';
    analysis.profileStrengths.push('Identidade visual estabelecida');
  } else {
    analysis.insights.profilePicture.rating = 1;
    analysis.insights.profilePicture.comment = 'Sem foto de perfil personalizada';
    analysis.improvementAreas.push('Falta imagem de perfil personalizada');
    analysis.recommendations.push('Adicione uma foto de perfil de alta qualidade para estabelecer sua identidade');
  }

  // Análise de verificação
  if (profileData.isVerified) {
    analysis.insights.verification.rating = 5;
    analysis.insights.verification.comment = 'Conta verificada (selo azul)';
    analysis.profileStrengths.push('Credibilidade confirmada com verificação oficial');
  } else {
    analysis.insights.verification.rating = 3;
    analysis.insights.verification.comment = 'Conta não verificada';
    // Não adicionamos como área de melhoria porque verificação é difícil de conseguir
  }

  // Link externo
  if (profileData.externalLink) {
    analysis.profileStrengths.push('Inclui link externo para direcionar tráfego');
  } else {
    analysis.improvementAreas.push('Sem link externo para conversão');
    analysis.recommendations.push('Adicione um link na bio para direcionar seguidores para seu site ou outras plataformas');
  }

  // Calcular taxa de engajamento estimada (fórmula simplificada)
  // Como não temos acesso a curtidas/comentários, usamos uma estimativa baseada na quantidade de seguidores
  let engagementEstimate = 0;
  if (profileData.stats.followers > 0) {
    if (profileData.stats.followers >= 100000) {
      engagementEstimate = 1.5; // Geralmente contas grandes têm menor taxa de engajamento %
    } else if (profileData.stats.followers >= 10000) {
      engagementEstimate = 2.5;
    } else if (profileData.stats.followers >= 1000) {
      engagementEstimate = 3.5;
    } else {
      engagementEstimate = 4.5; // Contas menores tendem a ter maior engajamento %
    }
  }
  analysis.engagementRate = engagementEstimate;

  // Recomendações gerais
  if (profileData.stats.posts > 0 && profileData.stats.followers < 500) {
    analysis.recommendations.push('Interaja com contas semelhantes para aumentar sua visibilidade');
  }

  if (!profileData.category && profileData.stats.followers > 1000) {
    analysis.recommendations.push('Defina uma categoria para seu perfil para melhorar a descoberta');
  }

  if (profileData.isPrivate && profileData.stats.followers < 5000) {
    analysis.recommendations.push('Considere tornar sua conta pública para aumentar o crescimento');
  }

  // Calcular pontuação final de 0-100
  const ratingFactors = [
    analysis.insights.followers.rating * 2, // Peso 2x
    analysis.insights.posts.rating,
    analysis.insights.following.rating,
    analysis.insights.bio.rating,
    analysis.insights.profilePicture.rating,
    analysis.insights.verification.rating
  ];
  
  const totalPossiblePoints = 30; // 5 pontos * 6 fatores
  const earnedPoints = ratingFactors.reduce((sum, rating) => sum + rating, 0);
  analysis.profileScore = Math.round((earnedPoints / totalPossiblePoints) * 100);

  // Adiciona data da análise
  analysis.analyzedAt = new Date().toISOString();

  return analysis;
} 