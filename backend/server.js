const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');
// const { GoogleGenerativeAI } = require("@google/generative-ai"); // Remove Gemini
const OpenAI = require("openai"); // Importa OpenAI
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuração para servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos do frontend
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Rota catch-all para SPA
  app.get('*', (req, res) => {
    // Não redirecionar rotas da API
    if (req.url.startsWith('/api/')) {
      return;
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Dados fictícios para o perfil @ricardo_lpena para teste
const MOCK_PROFILE = {
  username: 'ricardo_lpena',
  fullName: 'Ricardo Lpena',
  bio: 'Developer & Digital Creator | Compartilhando conhecimento sobre tecnologia e desenvolvimento',
  profilePicture: 'https://placehold.co/150',
  followersCount: 2345,
  followingCount: 876,
  postsCount: 128,
  engagementRate: 0.045, // 4.5%
  media: [
    {
      url: 'https://placehold.co/500/8a3ab9/FFFFFF?text=Post+1',
      type: 'image',
      likes: 187,
      comments: 23
    },
    {
      url: 'https://placehold.co/500/e95950/FFFFFF?text=Post+2',
      type: 'image',
      likes: 203,
      comments: 17
    },
    {
      url: 'https://placehold.co/500/fccc63/000000?text=Post+3',
      type: 'video',
      likes: 412,
      comments: 45
    },
    {
      url: 'https://placehold.co/500/4c68d7/FFFFFF?text=Post+4',
      type: 'image',
      likes: 156,
      comments: 12
    },
    {
      url: 'https://placehold.co/500/3f729b/FFFFFF?text=Post+5',
      type: 'image',
      likes: 231,
      comments: 32
    },
    {
      url: 'https://placehold.co/500/cd486b/FFFFFF?text=Post+6',
      type: 'video',
      likes: 319,
      comments: 27
    }
  ]
};

// Catálogo de serviços
const SERVICES = {
  followers: [
    { qty: 1500, price: 99.99 },
    { qty: 3000, price: 189.90 },
    { qty: 5000, price: 289.90 },
    { qty: 10000, price: 569.90 },
    { qty: 30000, price: 1529.90 },
    { qty: 50000, price: 2499.90 },
    { qty: 100000, price: 4499.90 }
  ],
  likes: [
    { qty: 500, price: 45.00 },
    { qty: 1000, price: 60.00 }
  ],
  comments: [
    { qty: 10, price: 25.00 },
    { qty: 50, price: 90.00 }
  ],
  videoViews: [
    { qty: 1000, price: 55.00 },
    { qty: 5000, price: 240.00 }
  ],
  storyViews: [
    { qty: 1000, price: 75.00 }
  ],
  liveViews: [
    { qty: 500, duration: "1h", price: 299.90 }
  ],
  paidTraffic: { service: "Gestão de Tráfego Pago", price: 800.00 },
  socialMedia: { service: "Planos de Social Media", startingPrice: 499.99 }
};

// Credenciais de login do Instagram
const INSTAGRAM_CREDENTIALS = {
  username: 'arlindamaranhao65',
  password: 'Th110490@'
};

// Inicializa OpenAI se a chave API estiver presente
let openai;
if (process.env.OPENAI_API_KEY) {
  console.log("Chave API OpenAI encontrada. Inicializando...");
  try {
    // Exibir os primeiros caracteres para debug (nunca exiba a chave inteira)
    const keyStart = process.env.OPENAI_API_KEY.substring(0, 10);
    console.log(`Formato da chave: ${keyStart}... (${process.env.OPENAI_API_KEY.length} caracteres)`);
    
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false, // Forçar uso apenas em backend
    });
    
    // Testar a conexão imediatamente
    (async () => {
      try {
        console.log("Testando conexão com a API OpenAI...");
        const testResult = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "user", content: "Olá, teste de conexão." }
          ],
          max_tokens: 5
        });
        console.log("Conexão com a API OpenAI confirmada:", 
          testResult.choices && testResult.choices.length > 0 ? "Sucesso" : "Sem respostas");
      } catch (testErr) {
        // Se falhar com gpt-4, tentar outro modelo como fallback
        console.error("ERRO NO TESTE DE CONEXÃO:", testErr.message);
        try {
          console.log("Tentando modelo alternativo...");
          const fallbackResult = await openai.completions.create({
            model: "text-davinci-003", // Modelo de completions em vez de chat
            prompt: "Olá, teste de conexão.",
            max_tokens: 5
          });
          console.log("Conexão com modelo alternativo confirmada:", 
            fallbackResult.choices && fallbackResult.choices.length > 0 ? "Sucesso" : "Sem respostas");
          
          // Se chegar aqui, o modelo alternativo funcionou
          console.log("IMPORTANTE: Usando modelo alternativo para todas as chamadas");
          // Flag global para usar modelo alternativo
          global.useAlternativeModel = true;
        } catch (fallbackErr) {
          console.error("ERRO NO MODELO ALTERNATIVO:", fallbackErr.message);
          if (fallbackErr.response) {
            console.error("Status:", fallbackErr.response.status);
            console.error("Detalhes:", JSON.stringify(fallbackErr.response.data || {}, null, 2));
          }
          console.error("Desativando integração com OpenAI devido a falha nos testes");
          openai = null;
        }
      }
    })();
  } catch (err) {
    console.error("Erro ao inicializar OpenAI:", err);
    openai = null;
  }
} else {
  console.warn("Chave API OpenAI não encontrada no .env. A análise por IA será desativada.");
}

// Função de Scraper com Puppeteer
async function scrapeInstagramProfile(username) {
  let browser = null;
  try {
    console.log(`Iniciando scraping para: ${username}`);
    browser = await puppeteer.launch({
      headless: true, // Mude para false para ver o navegador abrir
      args: [
        '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
        '--lang=pt-BR,pt', '--disable-gpu', // Desabilitar GPU pode ajudar em alguns sistemas
        '--disable-infobars', '--window-size=1280,800' // Define tamanho da janela
      ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 }); // Define viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'); // User Agent mais recente
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7' });

    // Login no Instagram antes de acessar o perfil
    console.log('Tentando fazer login no Instagram...');
    try {
      // Acessar página de login
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle0', timeout: 60000 });
      
      // Aguardar pelo formulário de login
      await page.waitForSelector('input[name="username"]', { timeout: 15000 });
      
      // Preencher credenciais
      await page.type('input[name="username"]', INSTAGRAM_CREDENTIALS.username, { delay: 50 });
      await page.type('input[name="password"]', INSTAGRAM_CREDENTIALS.password, { delay: 50 });
      
      // Clicar no botão de login
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
        page.click('button[type="submit"]')
      ]);
      
      // Esperar um pouco para garantir que o login processou
      await page.waitForTimeout(3000);
      
      // Verificar se o login foi bem-sucedido (verificando se elementos típicos de falha de login não estão presentes)
      const loginFailed = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('p[data-testid="login-error-message"], div[role="alert"]');
        return errorElements.length > 0;
      });
      
      if (loginFailed) {
        console.error('Falha no login do Instagram. Verificar credenciais.');
      } else {
        console.log('Login no Instagram bem-sucedido');
        
        // Lidar com possíveis popups ou diálogos após login
        try {
          // Verificar se há diálogo de "Salvar informações de login"
          const saveLoginInfoButton = await page.$x("//button[contains(text(), 'Agora não')]");
          if (saveLoginInfoButton.length > 0) {
            await saveLoginInfoButton[0].click();
            await page.waitForTimeout(1000);
          }
          
          // Verificar se há diálogo de "Ativar notificações"
          const notNowButton = await page.$x("//button[contains(text(), 'Agora não')]");
          if (notNowButton.length > 0) {
            await notNowButton[0].click();
            await page.waitForTimeout(1000);
          }
        } catch (dialogError) {
          console.log('Nenhum diálogo encontrado ou erro ao processar diálogos:', dialogError.message);
        }
      }
    } catch (loginError) {
      console.error('Erro durante o processo de login:', loginError);
    }

    // Agora vamos para o perfil desejado
    const url = `https://www.instagram.com/${username}/`;
    console.log(`Navegando para: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 }); // Aumenta timeout e espera mais

    // Verificar se a página carregou corretamente ou se é "Página não encontrada"
    const pageNotFound = await page.evaluate(() => {
      const title = document.title.toLowerCase();
      const bodyText = document.body.innerText;
      return bodyText.includes('Esta página não está disponível') || title.includes('página não encontrada') || title.includes('page not found');
    });

    if (pageNotFound) {
      console.error(`Perfil não encontrado ou página indisponível para: ${username}`);
      return null;
    }

    // Verificar se é um perfil privado
    const isPrivate = await page.evaluate(() => {
      return document.body.innerText.includes('Esta conta é privada') ||
             document.body.innerText.includes('This account is private');
    });

    if (isPrivate) {
      console.log(`Perfil é privado: ${username}. Verificando se estamos logados e temos acesso...`);
      
      // Verificar se mesmo com login ainda não temos acesso (não seguimos a conta)
      const noAccess = await page.evaluate(() => {
        return document.body.innerText.includes('Seguir') || 
               document.body.innerText.includes('Follow');
      });
      
      if (noAccess) {
        console.log('Não temos acesso ao perfil privado, pois não seguimos esta conta.');
        // Você pode implementar aqui a ação de seguir a conta se desejar
      }
    }

    console.log(`Página carregada para: ${username}. Aguardando seletores...`);
    // Espera por um seletor chave do cabeçalho do perfil para garantir carregamento
    try {
      await page.waitForSelector('main header section', { timeout: 15000 });
    } catch (e) {
      console.warn('Seletor principal do cabeçalho não encontrado. A página pode não ter carregado completamente.');
      // Poderia retornar null aqui ou continuar tentando
    }

    console.log('Iniciando extração de dados...');

    // Capturar screenshot para debug
    await page.screenshot({ path: 'profile-debug.png' });
    console.log('Screenshot de debug salvo como profile-debug.png');

    const profileData = await page.evaluate((username) => {
      const data = { username };
      
      // Função melhorada para extrair números
      const extractCount = (text) => {
        if (!text) return 0;
        console.log(`Extraindo número de: "${text}"`);
        
        // Verificar se o texto contém unidades como "mi" (milhões) ou "mil" (milhares)
        const lowerText = text.toLowerCase();
        
        // Extrair números com milhões (por exemplo, "4,4 mi" em português ou "4.4M" em inglês)
        if (lowerText.includes('mi') || lowerText.includes('m ') || lowerText.includes('m\n') || lowerText.includes('m)') || lowerText.includes('m.')) {
          console.log('Detectado formato em MILHÕES');
          // Remover tudo exceto dígitos, vírgulas e pontos
          const numText = text.replace(/[^0-9,.]/g, '');
          
          // Converter para número, considerando formato brasileiro (vírgula como decimal)
          let value = parseFloat(numText.replace(',', '.'));
          
          // Multiplicar por 1 milhão
          return Math.round(value * 1000000);
        }
        
        // Extrair números com milhares (por exemplo, "15,7 mil" em português ou "15.7K" em inglês)
        if (lowerText.includes('mil') || lowerText.includes('k ') || lowerText.includes('k\n') || lowerText.includes('k)') || lowerText.includes('k.')) {
          console.log('Detectado formato em MILHARES');
          // Remover tudo exceto dígitos, vírgulas e pontos
          const numText = text.replace(/[^0-9,.]/g, '');
          
          // Converter para número, considerando formato brasileiro (vírgula como decimal)
          let value = parseFloat(numText.replace(',', '.'));
          
          // Multiplicar por 1 mil
          return Math.round(value * 1000);
        }
        
        // Para números sem sufixo de escala, remover pontos de milhar e converter vírgulas
        const cleanedText = text.replace(/\./g, '').replace(/,/g, '.');
        
        // Remover não-números exceto ponto decimal
        const numericPart = cleanedText.replace(/[^0-9.]/g, '');
        
        // Converter para número
        let num = parseFloat(numericPart);
        
        // Validar o resultado
        if (isNaN(num)) {
          console.warn(`Não foi possível extrair número de "${text}", retornando 0`);
          return 0;
        }
        
        const result = Math.round(num);
        console.log(`Número extraído: ${result}`);
        return result;
      };

      // MÉTODO 1: Tenta obter estatísticas usando seletores de lista
      const obtainStatsMethod1 = () => {
        console.log("Tentando método 1 para extrair estatísticas");
        const listItems = Array.from(document.querySelectorAll('main header section ul li'));
        
        if (listItems.length >= 3) {
          const stats = {
            postsCount: 0,
            followersCount: 0,
            followingCount: 0
          };
          
          // Para cada item da lista, tentar extrair o texto
          listItems.forEach((item, index) => {
            const text = item.textContent.trim();
            console.log(`Item ${index}: "${text}"`);
            
            if (text.includes('publicaç') || text.includes('post')) {
              stats.postsCount = extractCount(text);
            } else if (text.includes('seguidor')) {
              stats.followersCount = extractCount(text);
            } else if (text.includes('seguindo')) {
              stats.followingCount = extractCount(text);
            }
          });
          
          return stats;
        }
        return null;
      };
      
      // MÉTODO 2: Tenta obter estatísticas usando a ordem dos elementos
      const obtainStatsMethod2 = () => {
        console.log("Tentando método 2 para extrair estatísticas");
        const listItems = Array.from(document.querySelectorAll('main header section ul li span, main header section ul li button'));
        
        if (listItems.length >= 3) {
          return {
            postsCount: extractCount(listItems[0]?.innerText),
            followersCount: extractCount(listItems[1]?.innerText),
            followingCount: extractCount(listItems[2]?.innerText)
          };
        }
        return null;
      };
      
      // MÉTODO 3: Busca por textos específicos em toda a página
      const obtainStatsMethod3 = () => {
        console.log("Tentando método 3 para extrair estatísticas");
        const allText = document.body.innerText;
        const followerMatch = allText.match(/(\d[\d,.]*)\s*seguidores/i);
        const followingMatch = allText.match(/(\d[\d,.]*)\s*seguindo/i);
        const postsMatch = allText.match(/(\d[\d,.]*)\s*publicações/i) || 
                          allText.match(/(\d[\d,.]*)\s*posts/i);
        
        return {
          postsCount: postsMatch ? extractCount(postsMatch[1]) : 0,
          followersCount: followerMatch ? extractCount(followerMatch[1]) : 0,
          followingCount: followingMatch ? extractCount(followingMatch[1]) : 0
        };
      };
      
      // Tenta extrair estatísticas de conta privada (apenas visível quando logado)
      const obtainStatsForPrivateAccount = () => {
        console.log("Tentando extrair dados de conta privada");
        // Estatística de posts em conta privada (geralmente aparece de forma diferente)
        const privatePostCount = document.querySelector('main[role="main"] section span');
        let postsCount = 0;
        
        if (privatePostCount) {
          const postText = privatePostCount.innerText;
          if (postText.includes('publicaç') || postText.includes('post')) {
            postsCount = extractCount(postText);
          }
        }
        
        // Tenta extrair seguidores/seguindo de conta privada
        const followStats = Array.from(document.querySelectorAll('main[role="main"] ul li span'));
        let followersCount = 0;
        let followingCount = 0;
        
        followStats.forEach(stat => {
          const text = stat.innerText;
          if (text.includes('seguidor')) {
            followersCount = extractCount(text);
          } else if (text.includes('seguindo')) {
            followingCount = extractCount(text);
          }
        });
        
        return {
          postsCount,
          followersCount,
          followingCount
        };
      };
      
      // Tentar os métodos em sequência
      let stats = obtainStatsMethod1();
      
      if (!stats || (stats.postsCount === 0 && stats.followersCount === 0 && stats.followingCount === 0)) {
        stats = obtainStatsMethod2();
      }
      
      if (!stats || (stats.postsCount === 0 && stats.followersCount === 0 && stats.followingCount === 0)) {
        stats = obtainStatsMethod3();
      }
      
      // Se ainda não temos estatísticas e pode ser uma conta privada, tentar método específico
      if (!stats || (stats.postsCount === 0 && stats.followersCount === 0 && stats.followingCount === 0)) {
        const isPrivate = document.body.innerText.includes('Esta conta é privada') || 
                         document.body.innerText.includes('This account is private');
        
        if (isPrivate) {
          stats = obtainStatsForPrivateAccount();
        }
      }
      
      // Mesmo se todos os métodos falharem, garantir que temos um objeto estatísticas
      stats = stats || { postsCount: 0, followersCount: 0, followingCount: 0 };
      
      // Verificar se todos os valores são iguais (possível erro)
      if (stats.postsCount === stats.followersCount && stats.followersCount === stats.followingCount && stats.postsCount > 0) {
        console.warn("ALERTA: Todos os valores estatísticos são iguais. Possível erro de extração.");
      }
      
      // Adicionar estatísticas ao objeto de dados
      data.postsCount = stats.postsCount;
      data.followersCount = stats.followersCount;
      data.followingCount = stats.followingCount;

      // Extração da foto de perfil
      data.profilePicture = document.querySelector('main header img[data-testid="user-avatar"], main header img._aagv')?.src || 
                          document.querySelector('main header img')?.src;

      // Extração do nome completo
      const nameElement = document.querySelector('main header section h1, main header section h2, span[data-bloks-name="bk.components.Text"][role="button"]');
      if (nameElement) data.fullName = nameElement.innerText.trim();

      // Extração da Bio (MELHORADA - tenta vários seletores)
      let bioElement = document.querySelector('main header section div > h1 + span, main header section div._aa_c > span');

      // Se não encontrou com o seletor original, tenta alternativas
      if (!bioElement || !bioElement.innerText.trim()) {
        // Tenta outros seletores comuns para a bio
        const bioSelectors = [
          'header section > div:nth-child(3) > span',
          'header section div > span[dir="auto"]',
          'header div._aa_c > div > span',
          'header section > div > div > span',
          'header h1 + div > span',
          'article > div > div > span',
          'header span[title]',
          // Tentativa extrema: qualquer span em header com texto e sem href
          'header span:not(:has(a)):not(:empty)'
        ];
        
        for (const selector of bioSelectors) {
          bioElement = document.querySelector(selector);
          if (bioElement && bioElement.innerText.trim()) break;
        }
        
        // Última tentativa: meta description
        if (!bioElement || !bioElement.innerText.trim()) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc && metaDesc.content) {
            const content = metaDesc.content;
            // Tenta extrair a bio da descrição (formato comum: "X followers, X following, X posts - Bio")
            const bioMatch = content.match(/posts\s*-\s*(.*)/i);
            if (bioMatch && bioMatch[1]) {
              data.bio = bioMatch[1].trim();
              bioElement = { innerText: data.bio }; // Cria objeto fictício para controle de fluxo
            }
          }
        }
      }

      if (bioElement && bioElement.innerText.trim()) {
        data.bio = bioElement.innerText.trim();
      } else {
        // Texto mais claro quando realmente não conseguimos encontrar a bio
        data.bio = "Bio não encontrada. O Instagram pode ter alterado a estrutura da página.";
      }

      // Verificar se é perfil privado
      data.isPrivate = document.body.innerText.includes('Esta conta é privada') || 
                       document.body.innerText.includes('This account is private');

      // Mídias Recentes (URLs das Imagens/Thumbnails)
      data.media = [];
      
      // Se não for perfil privado ou tivermos acesso (logado e seguindo), tentar extrair imagens
      if (!data.isPrivate || document.querySelector('article')) {
        // Tenta várias abordagens para encontrar imagens
        const findImages = () => {
          // Método 1: Seletores específicos para estrutura atual
          const specificSelectors = [
            'article a[href*="/p/"] div._aagu img, article a[href*="/reel/"] div._aagu img',
            'article div._aabd img',
            'article div[role="button"] img',
            'main article img[srcset]',
            'div._aagv img', // Imagens em thumbnails
            'span[role="link"] img' // Algumas imagens em grid view
          ];
          
          for (const selector of specificSelectors) {
            const images = Array.from(document.querySelectorAll(selector));
            if (images.length > 0) {
              console.log(`Encontradas ${images.length} imagens usando seletor: ${selector}`);
              return images.slice(0, 6).map(img => img.src || img.srcset?.split(' ')[0]);
            }
          }
          
          // Método 2: Busca por URLs em links que parecem ser posts
          const postLinks = Array.from(document.querySelectorAll('a[href*="/p/"]'));
          if (postLinks.length > 0) {
            const linksWithImages = postLinks.filter(link => link.querySelector('img'));
            if (linksWithImages.length > 0) {
              console.log(`Encontradas ${linksWithImages.length} imagens em links de posts`);
              return linksWithImages.slice(0, 6).map(link => {
                const img = link.querySelector('img');
                return img?.src || img?.srcset?.split(' ')[0];
              });
            }
          }
          
          // Método 3: Última tentativa - pegar qualquer imagem que pareça ser um post
          const allImages = Array.from(document.querySelectorAll('img[srcset]')).filter(img => {
            // Filtrar imagens muito pequenas e avatares/ícones
            const rect = img.getBoundingClientRect();
            return rect.width > 100 && rect.height > 100 && !img.src.includes('profile_pic');
          });
          
          if (allImages.length > 0) {
            console.log(`Encontradas ${allImages.length} imagens gerais`);
            return allImages.slice(0, 6).map(img => img.src || img.srcset?.split(' ')[0]);
          }
          
          // Nenhuma imagem encontrada
          return [];
        };

        // Tenta encontrar as imagens
        const imageUrls = findImages();

        // Se encontrou imagens, processa-as
        if (imageUrls.length > 0) {
          imageUrls.forEach(url => {
            if (url) {
              data.media.push({ url, type: 'image', likes: Math.floor(Math.random() * 50) + 10, comments: Math.floor(Math.random() * 10) + 1 }); 
            }
          });
          console.log(`Extraídas ${data.media.length} imagens do perfil`);
        }
      }
      
      // Se não conseguiu extrair imagens (por ser privado ou outro motivo), usar placeholders
      if (data.media.length === 0) {
        console.log('Não foi possível extrair imagens, usando placeholder informativos');
        
        // Se não conseguiu extrair nenhuma imagem, cria placeholders informativos
        // que combinam com o tema do perfil, para uso em demonstração
        const themes = ['viagem', 'moda', 'comida', 'fitness', 'tecnologia', 'arte'];
        const profileTheme = username.includes('fit') || username.includes('gym') ? 'fitness' :
                             username.includes('dev') || username.includes('tech') ? 'tecnologia' :
                             username.includes('food') || username.includes('chef') ? 'comida' :
                             username.includes('art') || username.includes('design') ? 'arte' :
                             username.includes('travel') || username.includes('trip') ? 'viagem' :
                             'moda'; // default
        
        // Cria 6 placeholders temáticos
        for (let i = 1; i <= 6; i++) {
          data.media.push({
            url: `https://source.unsplash.com/random/400x400/?${profileTheme},${i}`,
            type: 'image',
            likes: Math.floor(Math.random() * 100) + 20,
            comments: Math.floor(Math.random() * 20) + 2
          });
        }
      }

      // Defaults
      data.fullName = data.fullName || username;
      data.profilePicture = data.profilePicture || 'https://placehold.co/150?text=?';
      data.engagementRate = 0.045; // Taxa de engajamento padrão (4.5%)

      return data;
    }, username);

    await browser.close();
    console.log(`Scraping concluído para: ${username}`);
    
    // Log de validação final
    console.log("Estatísticas extraídas:", {
      posts: profileData.postsCount,
      followers: profileData.followersCount,
      following: profileData.followingCount
    });
    
    return profileData;

  } catch (error) {
    console.error(`Erro GERAL durante o scraping para ${username}:`, error);
    if (browser) { await browser.close(); }
    throw new Error('Falha no scraping do perfil.');
  }
}

// Adicionar esta nova função em algum lugar apropriado (por exemplo, antes da rota /api/profile/:username)
/**
 * Gera uma análise local com base nos dados do perfil sem usar IA externa
 * @param {Object} profileData - Dados do perfil extraídos
 * @returns {string} - Texto da análise
 */
function generateLocalAnalysis(profileData) {
  // Verificar se temos uma bio válida
  const hasBio = !profileData.bio.includes("não encontrada") && !profileData.bio.includes("não extraída");
  
  // Calcular razão seguidores/seguindo
  const followRatio = profileData.followingCount > 0 
    ? (profileData.followersCount / profileData.followingCount).toFixed(2) 
    : 0;
  
  // Número de posts
  const hasManyPosts = profileData.postsCount > 50;
  
  // Iniciar a análise
  let analysis = `## Sugestões para @${profileData.username}\n\n`;
  
  // Analisar a bio
  if (!hasBio) {
    analysis += "1. **Otimize sua Bio**: Crie uma biografia atraente que inclua:\n";
    analysis += "   - Uma descrição clara do seu nicho ou especialidade\n";
    analysis += "   - Palavras-chave relevantes para SEO do Instagram\n";
    analysis += "   - Emojis para destacar pontos importantes\n";
    analysis += "   - Uma call-to-action (ex: \"Clique no link abaixo\")\n\n";
  } else {
    analysis += "1. **Melhore sua Bio**: Certifique-se que sua bio comunique claramente seu valor e inclua palavras-chave relevantes.\n\n";
  }
  
  // Analisar razão seguidores/seguindo
  if (followRatio < 1) {
    analysis += `2. **Equilibre sua Relação Seguidores/Seguindo**: Sua proporção atual (${followRatio}) está abaixo do ideal. Considere:\n`;
    analysis += "   - Deixar de seguir contas inativas ou irrelevantes\n";
    analysis += "   - Interagir mais com contas em seu nicho para ganhar seguidores\n";
    analysis += "   - Utilizar hashtags mais estratégicas\n\n";
  } else {
    analysis += `2. **Mantenha seu Crescimento**: Sua proporção de seguidores/seguindo (${followRatio}) é positiva. Continue:\n`;
    analysis += "   - Interagindo com contas semelhantes à sua\n";
    analysis += "   - Usando hashtags relevantes e específicas\n\n";
  }
  
  // Analisar posts
  if (!hasManyPosts) {
    analysis += "3. **Aumente sua Frequência de Postagem**: Publique 3-5 vezes por semana para:\n";
    analysis += "   - Aumentar visibilidade no algoritmo\n";
    analysis += "   - Melhorar engajamento com seu público\n";
    analysis += "   - Criar mais oportunidades de descoberta\n\n";
  } else {
    analysis += "3. **Mantenha Consistência**: Continue com postagens regulares focando em qualidade e valor para seu público.\n\n";
  }
  
  // Sugestões comuns que se aplicam a qualquer perfil
  analysis += "4. **Estratégias de Conteúdo**: Diversifique seus formatos com:\n";
  analysis += "   - Reels curtos e criativos (prioridade no algoritmo atual)\n";
  analysis += "   - Carrosséis informativos (maior taxa de salvamento)\n";
  analysis += "   - Stories diários para manter engajamento\n\n";
  
  analysis += "5. **Aumente Engajamento**: Interaja ativamente respondendo comentários e participando de conversas em sua área.";
  
  return analysis;
}

// Rota para obter informações do perfil
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`Recebida requisição para perfil: ${username}`);

  try {
    let profileData = await scrapeInstagramProfile(username);
    
    // Gerar análise com OpenAI
    console.log(`Gerando análise com OpenAI para: ${username}`);
    
    if (openai) {
      console.log('Status da integração OpenAI: Disponível');
      try {
        console.log('Enviando requisição para OpenAI...');
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Você é um especialista em marketing digital e Instagram. 
                       Analise os dados do perfil e forneça 5 recomendações específicas para melhorar o perfil.
                       Retorne APENAS um array JSON com as recomendações, onde cada recomendação tem:
                       - title: título curto da recomendação
                       - description: descrição detalhada da recomendação
                       - benefits: array com 2-3 benefícios específicos
                       - priority: "Alta", "Média" ou "Baixa" baseado na importância`
            },
            {
              role: "user",
              content: `Analise este perfil do Instagram:
                       Username: ${profileData.username}
                       Seguidores: ${profileData.followersCount}
                       Seguindo: ${profileData.followingCount}
                       Posts: ${profileData.postsCount}
                       Bio: ${profileData.bio}
                       
                       Forneça 5 recomendações específicas para melhorar este perfil.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        });

        const aiResponse = completion.choices[0].message.content;
        console.log('Texto de resposta:', aiResponse);

        try {
          // Tentar extrair array JSON da resposta, mesmo se estiver cercado de texto
          let jsonContent = aiResponse;
          
          // Tentar encontrar o início e fim de um array JSON
          const arrayStartIndex = aiResponse.indexOf('[');
          const arrayEndIndex = aiResponse.lastIndexOf(']');
          
          if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
            jsonContent = aiResponse.substring(arrayStartIndex, arrayEndIndex + 1);
            console.log('Extraído JSON da resposta:', jsonContent);
          }
          
          // Tentar fazer o parse do JSON
          const recommendations = JSON.parse(jsonContent);
          
          if (Array.isArray(recommendations) && recommendations.length > 0) {
            console.log(`JSON analisado com sucesso: ${recommendations.length} recomendações`);
            
            // Verificar e corrigir cada recomendação para garantir formato correto
            profileData.aiAnalysis = recommendations.map(rec => ({
              title: rec.title || "Recomendação",
              description: rec.description || "Descrição não disponível",
              benefits: Array.isArray(rec.benefits) ? rec.benefits : ["Melhor visibilidade", "Aumento de engajamento"],
              priority: ["Alta", "Média", "Baixa"].includes(rec.priority) ? rec.priority : "Média"
            }));
            
            // Adicionar recomendações de serviços com base na análise do perfil
            try {
              // Segunda chamada à IA para sugerir serviços
              const serviceCompletion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: `Você é um consultor de marketing digital especializado em crescimento de Instagram.
                             Com base na análise do perfil, recomende entre 1-3 serviços da lista abaixo que seriam 
                             mais adequados para este perfil específico.
                             
                             Lista de serviços disponíveis:
                             1. Seguidores Brasileiros: 600-650 por R$ 54,90 (Teste), 1000-1300 por R$ 74,90, 2000-2300 por R$ 129,90
                             2. Curtidas Brasileiras: 500 por R$ 45,00, 1000 por R$ 60,00
                             3. Comentários Brasileiros: 10 por R$ 20,00, 50 por R$ 70,00, 100 por R$ 100,00
                             4. Visualizações em Stories: 1000 por R$ 69,90
                             5. Visualizações em Vídeos: 1000 por R$ 55,00
                             
                             Retorne APENAS um array JSON com os serviços recomendados, onde cada recomendação tem:
                             - service_type: tipo do serviço (ex: "seguidores", "curtidas")
                             - package: pacote específico (ex: "600-650 seguidores")
                             - price: preço do pacote
                             - reason: motivo da recomendação específico para este perfil (2-3 frases)`
                  },
                  {
                    role: "user",
                    content: `Analise este perfil do Instagram e recomende os serviços mais adequados:
                             Username: ${profileData.username}
                             Seguidores atuais: ${profileData.followersCount}
                             Seguindo: ${profileData.followingCount}
                             Posts: ${profileData.postsCount}
                             Bio: ${profileData.bio}
                             
                             Além das recomendações de marketing já feitas, quais serviços pagos seriam ideais para este perfil?`
                  }
                ],
                temperature: 0.7,
                max_tokens: 1000
              });
              
              const serviceResponse = serviceCompletion.choices[0].message.content;
              console.log('Resposta de serviços:', serviceResponse);
              
              // Extrair JSON da resposta
              let serviceJson = serviceResponse;
              const serviceStartIndex = serviceResponse.indexOf('[');
              const serviceEndIndex = serviceResponse.lastIndexOf(']');
              
              if (serviceStartIndex !== -1 && serviceEndIndex !== -1 && serviceEndIndex > serviceStartIndex) {
                serviceJson = serviceResponse.substring(serviceStartIndex, serviceEndIndex + 1);
              }
              
              // Tentar fazer o parse do JSON
              const serviceRecommendations = JSON.parse(serviceJson);
              
              if (Array.isArray(serviceRecommendations) && serviceRecommendations.length > 0) {
                profileData.serviceRecommendations = serviceRecommendations;
              }
            } catch (serviceError) {
              console.error('Erro ao gerar recomendações de serviços:', serviceError);
              // Fallback para recomendações padrão
              profileData.serviceRecommendations = [
                {
                  service_type: "seguidores",
                  package: profileData.followersCount < 1000 ? "1000-1300 seguidores" : "2000-2300 seguidores",
                  price: profileData.followersCount < 1000 ? 74.90 : 129.90,
                  reason: "Aumentar a base de seguidores é essencial para criar credibilidade e autoridade no Instagram. Este pacote ajudará a atingir o próximo nível."
                },
                {
                  service_type: "curtidas",
                  package: "500 curtidas",
                  price: 45.00,
                  reason: "Aumentar o engajamento nos posts demonstra relevância para o algoritmo do Instagram. Curtidas adicionais potencializam o alcance orgânico."
                }
              ];
            }
          } else {
            throw new Error('Formato de recomendações inválido');
          }
        } catch (parseError) {
          console.error('Erro ao analisar JSON da OpenAI:', parseError);
          // Fallback para análise local
          profileData.aiAnalysis = [
            {
              title: "Otimize sua Bio",
              description: "Crie uma biografia mais atraente e profissional que destaque sua expertise e proposta de valor.",
              benefits: [
                "Maior clareza sobre seu perfil",
                "Aumento nas conversões",
                "Melhor posicionamento profissional"
              ],
              priority: "Alta"
            },
            {
              title: "Aumente Engajamento",
              description: "Interaja mais com seu público através de stories, enquetes e perguntas.",
              benefits: [
                "Maior visibilidade no algoritmo",
                "Fortalecimento da comunidade",
                "Feedback direto do público"
              ],
              priority: "Média"
            },
            {
              title: "Crie Conteúdo em Reels",
              description: "Produza vídeos curtos e dinâmicos focados no seu nicho.",
              benefits: [
                "Maior alcance orgânico",
                "Conteúdo mais envolvente",
                "Prioridade no algoritmo"
              ],
              priority: "Alta"
            },
            {
              title: "Otimize Hashtags",
              description: "Use uma combinação estratégica de hashtags populares e nichadas.",
              benefits: [
                "Maior descoberta do perfil",
                "Alcance de público específico",
                "Melhor categorização do conteúdo"
              ],
              priority: "Média"
            },
            {
              title: "Mantenha Consistência",
              description: "Estabeleça uma frequência regular de postagens e mantenha uma identidade visual coesa.",
              benefits: [
                "Maior retenção de seguidores",
                "Perfil mais profissional",
                "Melhor previsibilidade para o público"
              ],
              priority: "Média"
            }
          ];
        }

        // Adicionar análise específica da bio se ela existir
        if (profileData.bio && !profileData.bio.includes("não encontrada")) {
          try {
            console.log('Gerando análise específica da bio...');
            
            const bioCompletion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: `Você é um especialista em otimização de perfis do Instagram.
                           Analise a bio fornecida e forneça feedback detalhado e sugestões de melhorias.
                           Retorne APENAS um objeto JSON com:
                           - score: pontuação de 1 a 5 (1=ruim, 5=excelente)
                           - strengths: array com pontos fortes da bio (máximo 3)
                           - weaknesses: array com pontos fracos da bio (máximo 3)
                           - improved_bio: versão melhorada da bio, mantendo o mesmo estilo mas otimizada
                           - explanation: breve explicação das melhorias (máximo 2 frases)`
                },
                {
                  role: "user",
                  content: `Analise esta bio de Instagram para o usuário @${profileData.username}:
                           "${profileData.bio}"
                           
                           Considere boas práticas como:
                           - Uso de emojis
                           - Quebras de linha adequadas
                           - Call-to-action claro
                           - Informações de contato
                           - Nicho/especialidade definido
                           - Comprimento adequado (máximo 150 caracteres)`
                }
              ],
              temperature: 0.7,
              max_tokens: 1000
            });
            
            const bioResponse = bioCompletion.choices[0].message.content;
            console.log('Resposta da análise de bio:', bioResponse);
            
            try {
              // Extrair o JSON da resposta
              let bioJson = bioResponse;
              const jsonStartIndex = bioResponse.indexOf('{');
              const jsonEndIndex = bioResponse.lastIndexOf('}');
              
              if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                bioJson = bioResponse.substring(jsonStartIndex, jsonEndIndex + 1);
              }
              
              const bioAnalysis = JSON.parse(bioJson);
              profileData.bioAnalysis = bioAnalysis;
              
            } catch (bioParseError) {
              console.error('Erro ao analisar JSON da análise de bio:', bioParseError);
              // Criar análise manual como fallback
              profileData.bioAnalysis = {
                score: 3,
                strengths: ["Bio existente com informações básicas"],
                weaknesses: ["Poderia ter mais emojis", "Falta call-to-action claro"],
                improved_bio: profileData.bio.includes("\n") ? profileData.bio : profileData.bio + "\n👇 Confira mais em nosso link",
                explanation: "Adicionei elementos visuais e call-to-action para aumentar o engajamento."
              };
            }
          } catch (bioError) {
            console.error('Erro ao gerar análise da bio:', bioError);
          }
        }

        // Debug final antes de enviar
        console.log('ENVIANDO PARA O CLIENTE:');
        console.log('Tem aiAnalysis?', profileData.aiAnalysis ? 'SIM' : 'NÃO');
        console.log('Tipo de aiAnalysis:', typeof profileData.aiAnalysis);
        if (Array.isArray(profileData.aiAnalysis)) {
          console.log('aiAnalysis é um array com', profileData.aiAnalysis.length, 'itens');
          if (profileData.aiAnalysis.length > 0) {
            console.log('Primeiro item:', JSON.stringify(profileData.aiAnalysis[0], null, 2));
          }
        }

      } catch (aiError) {
        console.error('Erro ao gerar análise com OpenAI:', aiError);
        // Em caso de erro, usar análise local como fallback
        profileData.aiAnalysis = generateLocalAnalysis(profileData);
      }
    } else {
      console.log('OpenAI não disponível, usando análise local');
      profileData.aiAnalysis = generateLocalAnalysis(profileData);
    }

    res.json(profileData);
  } catch (error) {
    console.error('Erro ao processar perfil:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar perfil' });
  }
});

// Rota para obter o catálogo de serviços
app.get('/api/services', (req, res) => {
  res.json(SERVICES);
});

// Configuração da porta
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 