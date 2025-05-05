const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Busca os dados do perfil do Instagram usando instagrapi (método preferido)
 * @param {string} username - Nome de usuário do Instagram
 * @returns {Promise<Object|null>} - Dados do perfil ou null se não encontrado
 */
async function fetchProfileDataWithInstagrapi(username) {
  try {
    console.log(`========== INSTAGRAPI ==========`);
    console.log(`Tentando buscar dados de ${username} via instagrapi...`);
    
    // Verificar se o script Python para instagrapi existe
    const pythonScriptPath = path.resolve(process.cwd(), '..', 'scripts', 'instagrapi_fetcher.py');
    
    console.log(`Verificando script em: ${pythonScriptPath}`);
    
    let scriptExists = false;
    try {
      await fs.access(pythonScriptPath);
      scriptExists = true;
      console.log('Script instagrapi encontrado.');
    } catch (err) {
      console.log('Script instagrapi não encontrado. Isso é um problema.');
      console.log(`Erro: ${err.message}`);
      return null;
    }
    
    if (!scriptExists) {
      console.log('O script não existe e não foi possível criá-lo. Desistindo do instagrapi.');
      return null;
    }
    
    // Executar o script Python com diferentes comandos possíveis
    console.log(`Tentando executar script com diferentes comandos Python...`);
    
    // Função para tentar um comando Python
    const tryPythonCommand = async (command) => {
      return new Promise((resolve) => {
        exec(`${command} --version`, (error) => {
          if (error) {
            console.log(`Comando '${command}' não disponível`);
            resolve(false);
          } else {
            console.log(`Comando '${command}' encontrado e será usado`);
            resolve(true);
          }
        });
      });
    };
    
    // Tentar diferentes comandos Python
    const isPython3Available = await tryPythonCommand('python3');
    const isPythonAvailable = await tryPythonCommand('python');
    
    let pythonCommand = null;
    if (isPython3Available) {
      pythonCommand = 'python3';
    } else if (isPythonAvailable) {
      pythonCommand = 'python';
    } else {
      console.log('Nenhum comando Python encontrado. Impossível executar instagrapi.');
      return null;
    }
    
    console.log(`Executando comando: ${pythonCommand} "${pythonScriptPath}" "${username}"`);
    
    return new Promise((resolve, reject) => {
      exec(`${pythonCommand} "${pythonScriptPath}" "${username}"`, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar instagrapi: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          console.log('========== FIM INSTAGRAPI (FALHA) ==========');
          // Falha silenciosa, vamos cair no método de fallback
          resolve(null);
          return;
        }
        
        if (stderr) {
          console.log(`Avisos do script: ${stderr}`);
        }
        
        console.log(`Saída bruta do script (primeiros 200 chars): ${stdout.substring(0, 200)}...`);
        
        try {
          const result = JSON.parse(stdout);
          
          // Verificar se houve erro no script Python
          if (result.error) {
            console.error(`Erro no script instagrapi: ${result.error}`);
            console.log('========== FIM INSTAGRAPI (ERRO) ==========');
            resolve(null);
            return;
          }
          
          // Adicionar timestamp
          result.timestamp = new Date().toISOString();
          
          console.log(`Dados recuperados com sucesso via instagrapi para ${username}`);
          console.log(`Seguidores: ${result.stats.followers}, Seguindo: ${result.stats.following}, Posts: ${result.stats.posts}`);
          console.log('========== FIM INSTAGRAPI (SUCESSO) ==========');
          resolve(result);
        } catch (parseError) {
          console.error(`Erro ao analisar resultado do instagrapi: ${parseError.message}`);
          console.log(`Saída completa: ${stdout}`);
          console.log('========== FIM INSTAGRAPI (ERRO PARSE) ==========');
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error(`Erro geral no instagrapi: ${error.message}`);
    console.log('========== FIM INSTAGRAPI (ERRO GERAL) ==========');
    return null;
  }
}

/**
 * Busca os dados do perfil do Instagram
 * @param {string} username - Nome de usuário do Instagram
 * @returns {Promise<Object|null>} - Dados do perfil ou null se não encontrado
 */
async function fetchProfileData(username) {
  console.log(`[FLUXO] Iniciando busca para ${username}. Tentando primeiro instagrapi...`);
  
  try {
    // Primeiro tentar com instagrapi (mais preciso)
    const instagrapiResult = await fetchProfileDataWithInstagrapi(username);
    
    if (instagrapiResult) {
      console.log(`[FLUXO] Dados obtidos com sucesso via instagrapi para ${username}`);
      return instagrapiResult;
    }
    
    // Se chegou aqui, o instagrapi falhou
    console.log(`[FLUXO] Instagrapi falhou, usando método de scraping como fallback para ${username}...`);
  } catch (error) {
    console.error(`[FLUXO] Erro ao tentar usar instagrapi: ${error.message}`);
    console.log(`[FLUXO] Continuando com método de scraping...`);
  }
  
  // Fallback para o método de scraping com Puppeteer
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
        
        // Método 2: Busca direta por números dentro de elementos específicos
        const tryDirectStats = () => {
          // Seletores para elementos que contêm os números exatos
          const specificSelectors = {
            posts: [
              'span._ac2a', // Seletor para publicações
              'span[class*="_ac2a"]', // Variação
              'li:nth-child(1) span._aacl', // Primeiro item da lista
              'li:first-child span[class*="_aacl"]', // Variação
              // Seletores específicos para o elemento da imagem
              'li:first-child span.x78zum5 span.html-span', // Seletor para posts com classes específicas
              'li:first-child span[dir="auto"] span.html-span', // Variação com dir="auto"
              'span:contains("publicações"), span:contains("posts")' // Usando texto "publicações" ou "posts"
            ],
            followers: [
              'span._ac2a', // Seletor para seguidores
              'span[class*="_ac2a"]', // Variação
              'li:nth-child(2) span._aacl', // Segundo item da lista
              'li:nth-child(2) span[class*="_aacl"]', // Variação
              // Seletores para o número exato na div que contém o valor numérico
              'li a span span', // Seletor que captura o span dentro de outro span
              'a[href$="/followers/"] span span', // Link específico para seguidores
              // Seletores específicos para o elemento da imagem
              'span.x78zum5 span.html-span', // Seletor que captura span.html-span dentro de span.x78zum5 
              'span.x193iq5w span', // Outro seletor potencial baseado na classe
              'span[dir="auto"] span.html-span' // Spans com atributo dir="auto" contendo html-span
            ],
            following: [
              'span._ac2a', // Seletor para seguindo
              'span[class*="_ac2a"]', // Variação
              'li:nth-child(3) span._aacl', // Terceiro item da lista
              'li:nth-child(3) span[class*="_aacl"]', // Variação
              'a[href$="/following/"] span span', // Link específico para seguindo
              // Seletores específicos para o elemento da imagem
              'li:nth-child(3) span.x78zum5 span.html-span', // Seletor com classes específicas
              'li:nth-child(3) span[dir="auto"] span.html-span', // Variação com dir="auto"
              'span:contains("seguindo"), span:contains("following")' // Usando texto "seguindo" ou "following"
            ]
          };
          
          const stats = { posts: 0, followers: 0, following: 0 };
          
          // Tentar capturar o número exato para cada estatística
          for (const [statType, selectors] of Object.entries(specificSelectors)) {
            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              for (const el of elements) {
                const text = el.textContent.trim();
                
                // Para capturar o elemento específico da imagem (span com o valor numérico)
                if (selector.includes('span span') && el.parentElement) {
                  // Verificar se o elemento pai contém texto como "seguidores"
                  const parentText = el.parentElement.textContent.toLowerCase();
                  if (statType === 'followers' && parentText.includes('seguidores')) {
                    console.log("Encontrou elemento específico de seguidores:", text);
                  } else if (statType === 'following' && parentText.includes('seguindo')) {
                    console.log("Encontrou elemento específico de seguindo:", text);
                  } else if (statType === 'posts' && parentText.includes('publicações')) {
                    console.log("Encontrou elemento específico de publicações:", text);
                  }
                }
                
                // Buscar números no conteúdo
                if (text && /\d/.test(text)) {
                  const num = extractCount(text);
                  if (num > 0) {
                    stats[statType] = num;
                    console.log(`${statType} encontrado:`, num, 'do texto:', text);
                    break;
                  }
                }
              }
              if (stats[statType] > 0) break; // Se já encontramos, não procura mais
            }
          }
          
          return (stats.posts > 0 || stats.followers > 0 || stats.following > 0) ? stats : null;
        };
        
        // Método 3: Busca por texto e números específicos
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
        
        // Tenta método de busca direta por elementos específicos
        const directStats = tryDirectStats();
        if (directStats) {
          return directStats;
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
        
        console.log("Extraindo número de:", text);
        
        // Tentar encontrar o número exato nas tags HTML (geralmente está em um data-value ou aria-label)
        // Se o elemento contém um valor dentro de tags (como <span>50.039</span>), tentamos capturar esse valor
        if (/<[^>]*>\s*(\d+[\d,.]*)\s*<\//.test(text)) {
          const match = text.match(/<[^>]*>\s*(\d+[\d,.]*)\s*<\//);
          if (match && match[1]) {
            // Remover separadores e converter para número
            const cleanNumber = match[1].replace(/\D+/g, '');
            console.log("Número exato encontrado em HTML:", cleanNumber);
            return parseInt(cleanNumber, 10);
          }
        }
        
        // Tentar encontrar números específicos no texto, priorizando números completos
        const exactNumberMatch = text.match(/(\d+[\d,.]*)\s*(seguidores|seguindo|publicações|posts|followers|following)/i);
        if (exactNumberMatch && exactNumberMatch[1]) {
          // Limpar formatação (remover pontos, vírgulas, etc.)
          const cleanNumber = exactNumberMatch[1].replace(/\D+/g, '');
          console.log("Número exato encontrado:", cleanNumber);
          return parseInt(cleanNumber, 10);
        }
        
        // Se não encontrou número exato, tenta abreviações
        text = text.replace(/\s/g, '').toLowerCase();
        
        // Verificar se existe número dentro de algum elemento HTML (como <div>50.039</div>)
        const numberInHtml = text.match(/>(\d+[\d,.]*)</);
        if (numberInHtml && numberInHtml[1]) {
          const cleanNumber = numberInHtml[1].replace(/\D+/g, '');
          console.log("Número encontrado em HTML:", cleanNumber);
          return parseInt(cleanNumber, 10);
        }
        
        // Se ainda não encontrou, usar lógica de abreviação como backup
        let multiplier = 1;
        let numericPart = text;
        
        if (text.includes('k') || text.includes('mil')) {
          multiplier = 1000;
          numericPart = text.replace(/k|mil/g, '');
        } else if (text.includes('m') || text.includes('mi')) {
          multiplier = 1000000;
          numericPart = text.replace(/m|mi/g, '');
        }
        
        // Normaliza separadores decimais
        numericPart = numericPart.replace(',', '.');
        
        // Extrair número, mesmo dentro de texto
        const matches = numericPart.match(/([\d]+\.?[\d]*)/);
        if (matches && matches[1]) {
          const value = parseFloat(matches[1]) * multiplier;
          console.log("Número aproximado calculado:", value);
          return Math.round(value);
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
      
      // EXTRAÇÃO DE BIO - IMPLEMENTAÇÃO UNIVERSAL COM CLASSES ESPECÍFICAS
      let bio = '';
      
      try {
        console.log("Tentando extrair a bio do perfil:", username);
        
        // Classes específicas usadas pelo Instagram para a bio
        const bioClassSelectors = [
          'span._ap3a._aaco._aacu._aacx._aad7._aade', // Classes específicas identificadas
          'span[class*="_ap3a"][class*="_aaco"]', // Seletor parcial das classes
          'div[role="button"] span._ap3a', // Outra variação do seletor
          'header span._ap3a', // Seletor mais direto
          'span[dir="auto"]._ap3a', // Variação com atributo dir
          'span[class*="_aacl _aaco _aacu _aacx _aad7 _aade"]', // Sem underscores no início
          'span[class$="_aade"]', // Termina com _aade
          'div.x7a106z span' // Nova classe potencial
        ];
        
        // Tentativa com seletores específicos
        for (const selector of bioClassSelectors) {
          const elements = document.querySelectorAll(selector);
          console.log(`Seletor ${selector} encontrou ${elements.length} elementos`);
          
          if (elements && elements.length > 0) {
            // Filtrar elementos por critérios úteis
            const bioElements = Array.from(elements).filter(el => {
              const text = el.textContent.trim();
              
              // Textos muito curtos provavelmente não são bios
              if (text.length < 10) return false;
              
              // Textos que são estatísticas não são bios
              if (isStatisticsText(text)) return false;
              
              // Se contiver emoji, quebra de linha ou hashtag, muito provavelmente é uma bio
              if (hasEmoji(text) || text.includes('\n') || text.includes('#')) return true;
              
              // Se não tem características marcantes, só considerar se for bem longo
              return text.length > 20;
            });
            
            // Ordenar os elementos filtrados para encontrar o melhor candidato
            if (bioElements.length > 0) {
              bioElements.sort((a, b) => {
                const textA = a.textContent.trim();
                const textB = b.textContent.trim();
                
                // Priorizar textos com quebras de linha
                const aHasBreaks = textA.includes('\n');
                const bHasBreaks = textB.includes('\n');
                if (aHasBreaks && !bHasBreaks) return -1;
                if (!aHasBreaks && bHasBreaks) return 1;
                
                // Priorizar textos com emojis
                const aHasEmoji = hasEmoji(textA);
                const bHasEmoji = hasEmoji(textB);
                if (aHasEmoji && !bHasEmoji) return -1;
                if (!aHasEmoji && bHasEmoji) return 1;
                
                // Se ambos têm características similares, preferir o mais longo
                return textB.length - textA.length;
              });
              
              bio = bioElements[0].textContent.trim();
              console.log("Bio encontrada com seletor:", selector);
          break;
            }
          }
        }
        
        // Backup com abordagem mais genérica se necessário
        if (!bio) {
          console.log("Tentando abordagem genérica para obter a bio");
          const headerSection = getMetaSection();
          
          if (headerSection) {
            // Buscar todos os spans dentro do header
            const spans = headerSection.querySelectorAll('span');
            
            // Filtrar spans que possam conter bio
            const bioSpans = Array.from(spans).filter(span => {
              const text = span.textContent.trim();
              
              // Verificações básicas
              if (!text || text.length < 15) return false;
              if (isStatisticsText(text)) return false;
              
              // Buscar elementos com características comuns de bio
              return hasEmoji(text) || 
                    text.includes('\n') || 
                    text.includes('#') || 
                    text.includes('@') ||
                    text.length > 30;
            });
            
            if (bioSpans.length > 0) {
              // Ordenar por relevância
              bioSpans.sort((a, b) => b.textContent.length - a.textContent.length);
              bio = bioSpans[0].textContent.trim();
              console.log("Bio encontrada com método genérico");
            }
          }
        }
        
        console.log("Bio final extraída:", bio || "(nenhuma bio encontrada)");
      } catch (e) {
        console.error("Erro ao extrair bio:", e);
      }
      
      // Função auxiliar para verificar se um texto é de estatísticas
      function isStatisticsText(text) {
        // Verificar se contém palavras-chave de estatísticas
        if (text.match(/\b(publicações|seguidores|seguindo|posts|followers|following)\b/i)) {
          return true;
        }
        
        // Verificar se é apenas um número
        if (/^[\d,.\s]+$/.test(text)) {
          return true;
        }
        
        // Verificar se é um número com unidade (k, mil, m)
        if (/^[\d,.]+\s*(mil|k|m)$/i.test(text)) {
          return true;
        }
        
        // Verificar se é um número de posts/followers
        if (/^\d[\d,.]*\s*(mil|k|m)?\s*(publicações|posts|publications|seguidores|followers|seguindo|following)$/i.test(text)) {
          return true;
        }
        
        return false;
      }
      
      // Função para verificar se um texto contém emoji
      function hasEmoji(text) {
        const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}]/u;
        return emojiRegex.test(text);
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
        fullName,
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
async function analyzeInstagramProfile(profileData) {
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

// Exportar funções
module.exports = {
  fetchProfileData,
  fetchProfileDataWithInstagrapi,
  analyzeInstagramProfile
}; 