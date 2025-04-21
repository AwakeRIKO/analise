import puppeteer from 'puppeteer';

/**
 * Busca os dados do perfil do Instagram
 * @param {string} username - Nome de usuário do Instagram
 * @returns {Promise<Object|null>} - Dados do perfil ou null se não encontrado
 */
export async function fetchProfileData(username) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // Configurações para evitar detecção
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navegar para a página do perfil
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Espera alguns segundos para garantir carregamento completo
    await page.waitForTimeout(3000);

    // Verificar se o perfil existe
    const notFoundSelector = 'div.error-container';
    const hasError = await page.$(notFoundSelector) !== null;
    
    if (hasError) {
      return null;
    }

    // Extrair dados do perfil
    const profileData = await page.evaluate((username) => {
      // Seletores para encontrar a área principal do perfil
      const getMetaSection = () => {
        // Tenta diferentes seletores comuns para área principal
        const selectors = [
          'main header section',
          'header section',
          'main article header',
          'main header'
        ];
        
        for (const selector of selectors) {
          const section = document.querySelector(selector);
          if (section) return section;
        }
        return null;
      };
      
      const metaSection = getMetaSection();
      if (!metaSection) return null;
      
      // Função para extrair estatísticas com diferentes métodos
      const extractStats = () => {
        // Método 1: Lista de itens em ul>li - padrão comum do Instagram
        const tryStandardStats = () => {
          const statsSelectors = [
            'header section ul li',
            'header ul li',
            'main header ul li',
            'article ul li',
            'header section [role="listitem"]'
          ];
          
          let statsItems = [];
          for (const selector of statsSelectors) {
            statsItems = Array.from(document.querySelectorAll(selector));
            if (statsItems.length >= 3) break;
          }
          
          if (statsItems.length >= 3) {
            return statsItems;
          }
          return null;
        };
        
        // Método 2: Busca por texto e números específicos
        const tryTextBasedStats = () => {
          const allElements = document.querySelectorAll('span, div, a');
          const stats = { posts: 0, followers: 0, following: 0 };
          
          for (const el of allElements) {
            const text = el.textContent.toLowerCase().trim();
            // Buscar por padrões como: "123 posts" ou "123 publicações"
            if (text.match(/\d+\s+(posts|publicações|publications)/)) {
              const num = parseInt(text.match(/(\d+)/)[0]);
              if (!isNaN(num)) stats.posts = num;
            }
            else if (text.match(/\d+\s+(followers|seguidores)/)) {
              const num = parseInt(text.match(/(\d+)/)[0]);
              if (!isNaN(num)) stats.followers = num;
            }
            else if (text.match(/\d+\s+(following|seguindo)/)) {
              const num = parseInt(text.match(/(\d+)/)[0]);
              if (!isNaN(num)) stats.following = num;
            }
          }
          
          return (stats.posts > 0 || stats.followers > 0 || stats.following > 0) ? stats : null;
        };
        
        // Tenta primeiro o método padrão
        const standardItems = tryStandardStats();
        if (standardItems) {
          return standardItems;
        }
        
        // Se não funcionar, tenta o baseado em texto
        const textBasedStats = tryTextBasedStats();
        if (textBasedStats) {
          return textBasedStats;
        }
        
        return null;
      };
      
      const extractCount = (text) => {
        if (!text) return 0;
        
        // Trata abreviações como "1,2mil", "1,2M", "1.2K" etc
        text = text.replace(/\s/g, '').toLowerCase();
        let multiplier = 1;
        
        if (text.includes('k') || text.includes('mil')) {
          multiplier = 1000;
          text = text.replace(/k|mil/g, '');
        } else if (text.includes('m') || text.includes('mi')) {
          multiplier = 1000000;
          text = text.replace(/m|mi/g, '');
        }
        
        // Normaliza separadores decimais
        text = text.replace(',', '.');
        
        // Extrai número
        const matches = text.match(/([\d]+\.?[\d]*)/);
        if (matches && matches[1]) {
          return Math.round(parseFloat(matches[1]) * multiplier);
        }
        
        return 0;
      };
      
      // Tenta extrair estatísticas
      const statsResult = extractStats();
      let stats = { posts: 0, followers: 0, following: 0 };
      
      if (Array.isArray(statsResult)) {
        // Se temos itens de lista, extraímos os números deles
        if (statsResult.length >= 3) {
          stats.posts = extractCount(statsResult[0]?.innerText || '0');
          stats.followers = extractCount(statsResult[1]?.innerText || '0');
          stats.following = extractCount(statsResult[2]?.innerText || '0');
        }
      } else if (statsResult && typeof statsResult === 'object') {
        // Se já temos os números diretamente
        stats = statsResult;
      }
      
      // Extrair nome do perfil com seletores robustos
      let fullName = '';
      const nameSelectors = [
        'header h1', 'header h2', 'header span[dir="auto"]',
        'main header h1', 'main header h2',
        'header section h2', 'article h2'
      ];
      
      for (const selector of nameSelectors) {
        const nameElement = document.querySelector(selector);
        if (nameElement && nameElement.textContent.trim()) {
          fullName = nameElement.textContent.trim();
          break;
        }
      }
      
      // Extrair bio com múltiplos seletores
      let bio = '';
      const bioSelectors = [
        'header section div > span:not(:empty)',
        'header div span[dir="auto"]', 
        'main header div > span', 
        'article div > span',
        'header section > div:nth-child(3) > span'
      ];
      
      for (const selector of bioSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const text = el.textContent.trim();
          if (text && text.length > 5 && !text.includes('seguidores') && !text.includes('seguindo')) {
            bio = text;
            break;
          }
        }
        if (bio) break;
      }
      
      // Extrair foto de perfil com múltiplos seletores
      let profilePicture = '';
      const imgSelectors = [
        'header img', 
        'main header img', 
        'div[role="button"] img',
        'article header img',
        'img[data-testid="user-avatar"]'
      ];
      
      for (const selector of imgSelectors) {
        const img = document.querySelector(selector);
        if (img && img.src && !img.src.includes('default')) {
          profilePicture = img.src;
          break;
        }
      }
      
      // Verificar se é conta verificada
      let isVerified = false;
      const verifiedSelectors = [
        'header span[title="Verificado"]',
        'header svg[aria-label="Verificado"]',
        'header img[alt*="verificado"]'
      ];
      
      for (const selector of verifiedSelectors) {
        if (document.querySelector(selector)) {
          isVerified = true;
          break;
        }
      }
      
      // Verificar se tem link externo
      let externalLink = '';
      const linkSelectors = [
        'header a[href*="linktr.ee"]',
        'header a[rel="me nofollow"]',
        'header a[target="_blank"]'
      ];
      
      for (const selector of linkSelectors) {
        const link = document.querySelector(selector);
        if (link && link.href) {
          externalLink = link.href;
          break;
        }
      }
      
      // Verificar se a conta é privada
      let isPrivate = false;
      const privateTexts = ['conta é privada', 'private account', 'privada'];
      
      for (const text of privateTexts) {
        if (document.body.innerText.toLowerCase().includes(text)) {
          isPrivate = true;
          break;
        }
      }
      
      // Obter categoria do perfil
      let category = '';
      const categorySelectors = [
        'header a[href*="directory"]',
        'header a[href*="categories"]'
      ];
      
      for (const selector of categorySelectors) {
        const categoryElement = document.querySelector(selector);
        if (categoryElement && categoryElement.textContent) {
          category = categoryElement.textContent.trim();
          break;
        }
      }
      
      return {
        username,
        fullName: fullName || username,
        bio,
        stats,
        isVerified,
        externalLink,
        profilePicture,
        hasCustomProfilePicture: !!profilePicture,
        category,
        isPrivate,
        timestamp: new Date().toISOString()
      };
    }, username);

    if (!profileData) {
      return null;
    }

    return profileData;

  } catch (error) {
    console.error('Erro ao buscar perfil do Instagram:', error);
    return null;
  } finally {
    await browser.close();
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